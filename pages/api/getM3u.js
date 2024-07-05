import fetch from "cross-fetch";

const getUserChanDetails = async () => {
    try {
        // Fetch HMAC data
        const responseHmac = await fetch("https://tplayapi.code-crafters.app/321codecrafters/hmac.json");
        if (!responseHmac.ok) {
            throw new Error(`Failed to fetch HMAC data. Status: ${responseHmac.status}`);
        }
        const data = await responseHmac.json();
        const hmacValue = data.data.hmac.hdntl.value;

        // Fetch channel data
        const responseChannels = await fetch("https://tplayapi.code-crafters.app/321codecrafters/fetcher.json");
        if (!responseChannels.ok) {
            throw new Error(`Failed to fetch channel data. Status: ${responseChannels.status}`);
        }
        const cData = await responseChannels.json();

        if (!cData || !cData.data || !Array.isArray(cData.data.channels)) {
            throw new Error("Invalid channel data format");
        }

        // Process channels
        const channels = cData.data.channels.flat().map(channel => ({
            id: channel.id,
            name: channel.name,
            tvg_id: channel.tvg_id,
            group_title: channel.genres?.[0] || null,
            tvg_logo: channel.logo_url,
            stream_url: channel.manifest_url,
            license_url: channel.license_url,
            stream_headers: channel.manifest_headers?.['User-Agent'] || null,
            drm: channel.drm,
            is_mpd: channel.is_mpd,
            kid_in_mpd: channel.kid_in_mpd,
            hmac_required: channel.hmac_required,
            key_extracted: channel.key_extracted,
            pssh: channel.pssh,
            clearkey: channel.clearkeys?.[0]?.base64 || null,
            hma: hmacValue
        }));

        // Add SonyLiv channels
        const sonyLivChannels = [
            {
                id: "sony_kal",
                name: "Sony Kal",
                group_title: "SonyLiv",
                tvg_logo: "https://c.evidon.com/pub_logos/2796-2021122219404475.png",
                stream_url: "https://spt-sonykal-1-us.lg.wurl.tv/playlist.m3u8"
            },
            {
                id: "set_hd",
                name: "SET HD",
                group_title: "SonyLiv",
                tvg_logo: "https://sonypicturesnetworks.com/images/logos/SET-LOGO-HD.png",
                stream_url: "https://dai.google.com/ssai/event/HgaB-u6rSpGx3mo4Xu3sLw/master.m3u8"
            },
            {
                id: "sony_sab_hd",
                name: "Sony SAB HD",
                group_title: "SonyLiv",
                tvg_logo: "https://sonypicturesnetworks.com/images/logos/SONY%20SAB%20HD_WHITE.png",
                stream_url: "https://dai.google.com/ssai/event/UI4QFJ_uRk6aLxIcADqa_A/master.m3u8"
            },
            // Add more channels here following the same format
            // Repeat the structure for each additional channel
        ];

        // Merge existing channels with SonyLiv channels
        const allChannels = [...channels, ...sonyLivChannels];

        return { channels: allChannels };
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return { channels: [] }; // Return empty array in case of error
    }
};

const generateM3u = async () => {
    try {
        const { channels } = await getUserChanDetails();

        // Generate M3U playlist
        let m3uStr = '#EXTM3U x-tvg-url="https://raw.githubusercontent.com/mitthu786/tvepg/main/tataplay/epg.xml.gz"\n\n';

        channels.forEach(channel => {
            m3uStr += `#EXTINF:-1 tvg-id="${channel.id}" group-title="${channel.group_title}" tvg-logo="${channel.tvg_logo}", ${channel.name}\n`;
            m3uStr += '#KODIPROP:inputstream.adaptive.license_type=clearkey\n';
            m3uStr += `#KODIPROP:inputstream.adaptive.license_key=${channel.clearkey}\n`;
            m3uStr += `#EXTVLCOPT:http-user-agent=${channel.stream_headers}\n`;
            m3uStr += `#EXTHTTP:{"cookie":"${channel.hma}"}\n`;
            m3uStr += `${channel.stream_url}|cookie:${channel.hma}\n\n`;
        });

        console.log('M3U playlist generated successfully');
        return m3uStr;
    } catch (error) {
        console.error('Error generating M3U playlist:', error);
        return ''; // Return empty string in case of error
    }
};

export default async function handler(req, res) {
    try {
        const m3uString = await generateM3u();

        if (m3uString) {
            res.status(200).send(m3uString);
        } else {
            res.status(500).send('Failed to generate M3U playlist');
        }
    } catch (error) {
        console.error('API request failed:', error);
        res.status(500).send('Internal Server Error');
    }
}
