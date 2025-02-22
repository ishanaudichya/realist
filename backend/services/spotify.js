require('dotenv').config({ path: '../.env' });

const User = require('../models/userModel');
const fetch = require('node-fetch');

const refreshToken = async (refresh_token) => {
    const authOptions = {
        method: 'POST',
        headers: {
            Authorization:
                'Basic ' +
                Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID +
                        ':' +
                        process.env.SPOTIFY_CLIENT_SECRET
                ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=refresh_token&refresh_token=${refresh_token}`,
    };

    const response = await fetch(
        'https://accounts.spotify.com/api/token',
        authOptions
    ).then((r) => r.json());

    const token = response.access_token;

    await User.findOneAndUpdate({ refresh_token }, { access_token: token });
    return token;
};

// type =  artists or tracks
// limit = # btwn 1 to 50
// time_range = long_term (calculated from several years of data including all new data as it becomes available)
//              medium_term (approximately last 6 months),
//              short_term (approximately last 4 weeks).

const getTop = async (token, refresh_token, type, limit, time_range) => {
    const response = await fetch(
        `https://api.spotify.com/v1/me/top/${type}?limit=${limit}&time_range=${time_range}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    ).then((r) => r.json());
    if (response.error?.message === 'The access token expired') {
        const refreshedToken = await refreshToken(refresh_token);
        const recall = await getTop(
            refreshedToken,
            refresh_token,
            type,
            limit,
            time_range
        );
        return recall;
    } else {
        return response;
    }
};

const getRecentlyPlayed = async (token, refresh_token, limit) => {
    const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 200) {
        const r = await response.json();
        return r.items[0];
    } else if (response.status === 401) {
        const refreshedToken = await refreshToken(refresh_token);
        const recall = await getRecentlyPlayed(
            refreshedToken,
            refresh_token,
            limit
        );
        return recall;
    }
};

const getNowPlaying = async (token, refresh_token) => {
    const response = await fetch(
        `https://api.spotify.com/v1/me/player/currently-playing`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 200) {
        let r = await response.json();
        if (r.currently_playing_type !== 'track')
            r = await getRecentlyPlayed(token, refresh_token, 1);
        return r;
    } else if (response.status === 204) {
        const lastPlayedSong = await getRecentlyPlayed(token, refresh_token, 1);
        return lastPlayedSong;
    } else if (response.status === 401) {
        const refreshedToken = await refreshToken(refresh_token);
        const recall = await getNowPlaying(refreshedToken, refresh_token);
        return recall;
    }
};

const getUserProfile = async (token, refresh_token) => {
    const response = await fetch(`https://api.spotify.com/v1/me/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 200) {
        const r = await response.json();
        return r;
    } else if (response.status === 401) {
        const refreshedToken = await refreshToken(refresh_token);
        const recall = await getUserProfile(refreshedToken, refresh_token);
        return recall;
    }
};

const recommendThreeTracks = async (
    token,
    refresh_token,
    artistID,
    trackID
) => {
    // use getTop to get the 5 top tracks. 3 tracks used for track id, 2 will grab artist id
    // takes 3 track ids, 2 artist ids

    const response = await fetch(
        `https://api.spotify.com/v1/recommendations?limit=3&seed_artists=${artistID}&seed_tracks=${trackID}&target_popularity=50`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 200) {
        const r = await response.json();
        return r.tracks;
    } else if (response.status === 401) {
        const refreshedToken = await refreshToken(refresh_token);
        const recall = await recommendThreeTracks(
            refreshedToken,
            refresh_token,
            artistID,
            trackID
        );
        return recall;
    }
};
// const getTrackImage = async (token, refresh_token, id) => {
//     const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
//         method: 'GET',
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     });

//     if (response.status === 200) {
//         response.json().then((data) => {
//             console.log(data.album.images.url);
//             return album.images.url;
//         });
//     } else {
//         const errorHeader = response.headers.get('www-authenticate');
//         const strippedError = errorHeader.substring(
//             errorHeader.indexOf('error_description="') +
//                 'error_description="'.length,
//             errorHeader.length - 1
//         );

//         if (strippedError === 'The access token expired') {
//             const refreshedToken = await refreshToken(refresh_token);
//             getTrackImage(refreshedToken, refresh_token, id);
//         }
//     }
// };

module.exports = {
    refreshToken,
    getTop,
    getUserProfile,
    getNowPlaying,
    getRecentlyPlayed,
    recommendThreeTracks,
};
