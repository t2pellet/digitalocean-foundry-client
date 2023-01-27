import React, { useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import network from '../util/network';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router';
import { authWrapper } from '../util/auth';
import Loading from '../component/Loading';

function Panel(props: { token: string }) {
  const { token } = props;
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const [loaded, setLoaded] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [serverStatus, setServerStatus] = useState('off');

  const getHelper = async (path: string) => {
    setExecuting(true);
    try {
      const result = await network.get(path, token);
      setExecuting(false);
      return result;
    } catch (e) {
      navigate('/error');
      throw e;
    }
  };

  const postHelper = async (path: string) => {
    setExecuting(true);
    try {
      return await network.post(path, token);
    } catch (e) {
      console.error(e);
      navigate('/error');
    }
    setExecuting(false);
  };

  const getIP = async () => {
    const result = await getHelper('instance/ip');
    console.log(`Got IP: ${result.data.ip}`);
    return result.data.ip;
  };

  const loadStatus = () => {
    const doLoad = async () => {
      const status = await getHelper('instance/status');
      setServerStatus(status?.data.status);
      setLoaded(true);
    };
    doLoad().catch((e) => {
      console.error(e);
      navigate('/error');
    });
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loaded && !executing) {
    const isOff = serverStatus == 'off';
    const isDeleted = serverStatus == 'deleted';
    return (
      <div className="Panel">
        <Button
          sx={{ position: 'absolute', top: 0, right: 0 }}
          onClick={() => logout({ returnTo: '/' })}>
          Logout
        </Button>
        <Grid container spacing={2} columns={12} maxWidth="100%" justifyContent="center">
          <Grid xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={async () => (window.location.href = await getIP())}
              disabled={isOff || isDeleted}>
              Go to Server
            </Button>
          </Grid>
          <Grid xs={12} md={4}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={async () => {
                await postHelper(`instance/${isDeleted ? 'start' : 'stop'}`);
                loadStatus();
              }}>
              disabled={isOff}
              {isDeleted ? 'Start Server' : 'Stop Server'}
            </Button>
          </Grid>
          <Grid xs={12} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={async () => {
                await postHelper('instance/save');
              }}
              disabled={isOff || isDeleted}>
              Save Server
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  } else return <Loading />;
}

function ConnectedPanel(): React.ReactElement {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    const getToken = async () => {
      const token = await getAccessTokenSilently();
      setToken(token);
      return token;
    };
    getToken()
      .catch(console.error)
      .then(async (result) => {
        const token = result as string;
        network
          .get('user/exists', token)
          .then((result) => {
            setRegistered(result.data);
            setLoaded(true);
          })
          .catch((e) => navigate('/error'));
      });
  }, []);

  if (loaded && !registered) {
    navigate('/setup');
    return <Loading />;
  }

  return (
    <div className="Panel">
      <Stack spacing={4} justifyContent="center" alignItems="center">
        <img src="/logo192.png" alt="Foundry Logo" width="192" />
        {loaded ? <Panel token={token} /> : <Loading />}
      </Stack>
    </div>
  );
}

export default authWrapper(ConnectedPanel);
