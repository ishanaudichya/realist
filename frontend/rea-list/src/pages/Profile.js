import UserStats from '../templates/UserStats.js';
import UserHead from '../templates/UserHead.js';
import ProfileNavbar from '../templates/ProfileNavbar.js';
import '../styles/ProfileButtons.css';
import '../styles/ProfilePageStyles.css';
import { useLogout } from '../hooks/useLogout.js';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useLogout();
    const { user, dispatch } = useAuthContext();
    const [loggedIn, setLoggedIn] = useState(user.spotifyToken);
    const [pfp, setPfp] = useState(null);
    const [artists, setArtists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);

    const updateDB = async (data) => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND + 'api/users/token',
            {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    Authorization: `Bearer ${user.idToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const json = await response.json();

        setLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(json));
        dispatch({ type: 'LOGIN', payload: json });
        navigate('/profile');
    };

    const disconnectSpotify = async () => {
        const data = { username: user.username, idToken: user.idToken };
        const response = await fetch(
            process.env.REACT_APP_BACKEND + 'api/users/disconnectSpotify',
            {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: {
                    Authorization: `Bearer ${user.idToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const json = await response.json();

        setLoggedIn(false);
        localStorage.setItem('user', JSON.stringify(json));
        dispatch({ type: 'DISCONNECT', payload: json });
    };

    const fetchProfile = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND + 'api/main/profile/' + user.username,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${user.idToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const json = await response.json();
        setPfp(json.pfp[1]);

        if (json.topArtists !== undefined) {
            setArtists(json.topArtists.items);
            setSongs(json.topSongs.items);
        }
    };

    useEffect(() => {
        // Extract the query value from the URL
        const query = window.location.hash.substring(1);
        const decipher = new URLSearchParams(query);
        const access_token = decipher.get('access_token');
        const refresh_token = decipher.get('refresh_token');
        const data = { access_token, refresh_token };

        if (data.access_token !== null && !user.spotifyToken) updateDB(data);

        fetchProfile();
    }, []);

    return (
        <>
            <ProfileNavbar />
    
            <div className="profile-contents">
                <UserHead pfp={pfp} username={user.username} />
                <div className="logout">
                    {!loggedIn ? (
                        <a
                            href={`${process.env.REACT_APP_BACKEND}api/spotify/auth`}
                        >
                            <button className="SpotifyConnect">
                                Connect to Spotify
                            </button>
                        </a>
                    ) : (
                        <button
                            className="SpotifyConnect"
                            onClick={disconnectSpotify}
                        >
                            Disconnect Spotify
                        </button>
                    )}
                    <button className="LogoutButton" onClick={logout}>
                        Log Out
                    </button>
                </div>
    
                <UserStats artists={artists} songs={songs} />
            </div>
        </>
    );
    
};

export default Profile;
