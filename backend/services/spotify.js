require('dotenv').config({ path: '../.env' });
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
    return token;
};

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
    response.error.message;
    if (response.error?.message === 'The access token expired') {
        const refreshedToken = await refreshToken(refresh_token);
        getTop(refreshedToken, refresh_token, type, limit, time_range);
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
        response.json().then((data) => {
            const tracks = data.items.map((x) => x.track).map((x) => x.name);
            const ids = data.items.map((x) => x.track).map((x) => x.id);
            console.log(tracks[0]);
            console.log(ids[0]);
            return data.items;
        });
    } else {
        const errorHeader = response.headers.get('www-authenticate');
        const strippedError = errorHeader.substring(
            errorHeader.indexOf('error_description="') +
                'error_description="'.length,
            errorHeader.length - 1
        );

        if (strippedError === 'The access token expired') {
            const refreshedToken = await refreshToken(refresh_token);
            getRecentlyPlayed(refreshedToken, refresh_token, limit);
        }
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
        response.json().then((data) => {
            console.log(data.item.name);
            return data;
        });
    } else if (response.status === 204) {
        getRecentlyPlayed(token, refresh_token, 1);
    } else {
        const errorHeader = response.headers.get('www-authenticate');
        const strippedError = errorHeader.substring(
            errorHeader.indexOf('error_description="') +
                'error_description="'.length,
            errorHeader.length - 1
        );

        if (strippedError === 'The access token expired') {
            const refreshedToken = await refreshToken(refresh_token);
            getNowPlaying(refreshedToken, refresh_token);
        }
    }
};

const getUserProfilePic = async (token, refresh_token) => {
    const response = await fetch(`https://api.spotify.com/v1/me/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.status === 200) {
        response.json().then((data) => {
            console.log(data.images[1].url); // grabs url of image that's 300x300
            return data.images;
        });
    } else {
        const errorHeader = response.headers.get('www-authenticate');
        const strippedError = errorHeader.substring(
            errorHeader.indexOf('error_description="') +
                'error_description="'.length,
            errorHeader.length - 1
        );
        if (strippedError === 'The access token expired') {
            const refreshT = await refreshToken(refresh_token);
            getUserProfilePic(refreshT, refresh_token);
        }
    }
};

const getTrackImage = async (token, refresh_token, id) => {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 200) {
        response.json().then((data) => {
            console.log(data.album.images.url);
            return album.images.url;
        });
    } else {
        const errorHeader = response.headers.get('www-authenticate');
        const strippedError = errorHeader.substring(
            errorHeader.indexOf('error_description="') +
                'error_description="'.length,
            errorHeader.length - 1
        );

        if (strippedError === 'The access token expired') {
            const refreshedToken = await refreshToken(refresh_token);
            getTrackImage(refreshedToken, refresh_token, id);
        }
    }
};

module.exports = {
    refreshToken,
    getTop,
    getNowPlaying,
    getRecentlyPlayed,
    getUserProfilePic,
    getTrackImage,
};
