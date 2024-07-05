import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Button, Grid, Header, Message, Segment } from 'semantic-ui-react';
import axios from 'axios';

const BITLY_API_TOKEN = '068dfecf9be53747723678426ca6758a0c9df94d'; // Replace with your Bitly API token

export default function Home() {
  const [dynamicUrl, setDynamicUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function generateDynamicUrl() {
      const longUrl = `${window.location.origin.replace('localhost', '127.0.0.1')}/api/getM3u?sid=tplay_A&id=1422421949&sname=tataP&tkn=cheapgeeky.com`;

      try {
        const response = await axios.post('https://api-ssl.bitly.com/v4/shorten', {
          long_url: longUrl
        }, {
          headers: {
            'Authorization': `Bearer ${BITLY_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          setDynamicUrl(response.data.link);
        } else {
          throw new Error('Failed to shorten URL');
        }
      } catch (error) {
        console.error('Error generating short URL:', error);
        setErr('Failed to generate short URL');
      }
    }

    generateDynamicUrl();
  }, []);

  function downloadM3uFile(filename) {
    setDownloading(true);
    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };

    fetch(window.location.origin + '/api/getM3u?sid=' + 'tplay' + '_' + 'A' + '&id=' + '123456789' + '&sname=' + 'tataP' + '&tkn=' + 'xeotpxyastrplg', requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        const data = result;
        const blob = new Blob([data], { type: 'text/plain' });
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveBlob(blob, filename);
        }
        else {
          const elem = window.document.createElement('a');
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
        setDownloading(false);
      })
      .catch(error => {
        console.error('Error downloading m3u file:', error);
        setDownloading(false);
        setErr('Failed to download m3u file');
      });
  }

  return (
    <div>
      <Head>
        <title>TATA PLAY COPY PASTE M3U</title>
        <meta
          name="description"
          content="Easiest way to generate a Tata Play IPTV (m3u) playlist."
        />
      </Head>
      <Grid columns='equal' padded centered>
        <Grid.Row>
          <Grid.Column></Grid.Column>
          <Grid.Column computer={8} tablet={12} mobile={16}>
            <Segment loading={downloading}>
              <Header as={'h1'}>Generate Tata Play m3u</Header>
              <Message>
                <Message.Header>Dynamic URL to get m3u: </Message.Header>
                <p>
                  <a href={dynamicUrl} target="_blank" rel="noreferrer">{dynamicUrl}</a>
                </p>
                <p>
                  You can use the above m3u URL in OTT Navigator or Tivimate app to watch all channels.
                </p>
                <p>
                  Set reload data to 2.5 hour in provider setting of Ott Navigator player &  Enjoy!
                </p>
                <Message.Header>You cannot generate a permanent m3u file URL on localhost but you can download your m3u file: </Message.Header>
                <p></p>
                <p>
                  <Button loading={downloading} primary onClick={() => downloadM3uFile('ts.m3u')}>Download m3u file</Button>
                </p>
                <p>The downloaded m3u file will be valid only for 2.5 Hours to 24 Hours.</p>
              </Message>
            </Segment>
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
        <Grid.Row style={{ display: err === '' ? 'none' : 'block' }}>
          <Grid.Column></Grid.Column>
          <Grid.Column computer={8} tablet={12} mobile={16}>
            <Message color='red'>
              <Message.Header>Error</Message.Header>
              <p>
                {err}
              </p>
            </Message>
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column></Grid.Column>
          <Grid.Column textAlign='center' computer={8} tablet={12} mobile={16}>
            <a href="https://cheapgeeky.com" target="_blank" rel="noreferrer">Visit CheapGeeky</a>
            <p>Made with ♥️ by Ankush.</p>
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
  }
