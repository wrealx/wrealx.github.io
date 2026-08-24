/* =========================================================
   WREAL X — LIVE DATA BACKEND
   server.js

   Purpose:
   - Securely handle API credentials
   - Provide live statistics to the frontend
   - Provide YouTube video view counts
   - Keep secrets out of GitHub's public frontend
========================================================= */

"use strict";


/* =========================================================
   DEPENDENCIES
========================================================= */

const express = require("express");
const cors = require("cors");
const path = require("path");


/* =========================================================
   CONFIGURATION
========================================================= */

const app = express();

const PORT =
  process.env.PORT || 3000;


/*
 * If you eventually deploy the frontend and backend
 * separately, put the frontend URL in FRONTEND_URL.
 *
 * Example:
 *
 * FRONTEND_URL=https://wrealx.github.io
 */

const FRONTEND_URL =
  process.env.FRONTEND_URL || "*";


/*
 * YouTube API key.
 *
 * IMPORTANT:
 * Never put the actual key directly into this file.
 *
 * Add it to your hosting provider's environment variables.
 */

const YOUTUBE_API_KEY =
  process.env.YOUTUBE_API_KEY || "";


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: FRONTEND_URL
  })
);

app.use(
  express.json()
);


/*
 * If this server is deployed with the frontend in the
 * same project, it can also serve the static website.
 */

app.use(
  express.static(
    path.join(
      __dirname,
      "."
    )
  )
);


/* =========================================================
   BASIC HEALTH CHECK
========================================================= */

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      status: "ok",

      artist: "Wreal X",

      service:
        "Wreal X Live Data API",

      timestamp:
        new Date().toISOString()

    });

  }
);


/* =========================================================
   YOUTUBE CONFIGURATION
========================================================= */

/*
 * Your YouTube channel:
 *
 * https://youtube.com/@wrealx
 *
 * A YouTube channel handle isn't always accepted directly
 * by every API request, so the backend first resolves the
 * handle into a channel ID.
 */

const YOUTUBE_HANDLE =
  "@wrealx";


/* =========================================================
   YOUTUBE REQUEST HELPER
========================================================= */

async function youtubeRequest(
  endpoint,
  params = {}
) {

  if (!YOUTUBE_API_KEY) {

    throw new Error(
      "YOUTUBE_API_KEY is not configured."
    );

  }


  const url =
    new URL(
      `https://www.googleapis.com/youtube/v3/${endpoint}`
    );


  url.searchParams.set(
    "key",
    YOUTUBE_API_KEY
  );


  Object.entries(params).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null
      ) {

        url.searchParams.set(
          key,
          value
        );

      }

    }
  );


  const response =
    await fetch(
      url.toString()
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data?.error?.message ||
      "YouTube API request failed."
    );

  }


  return data;

}


/* =========================================================
   RESOLVE YOUTUBE CHANNEL
========================================================= */

async function getYouTubeChannel() {

  const data =
    await youtubeRequest(
      "channels",
      {
        part: "snippet,statistics",
        forHandle: YOUTUBE_HANDLE
      }
    );


  if (
    !data.items ||
    !data.items.length
  ) {

    throw new Error(
      "Wreal X YouTube channel could not be found."
    );

  }


  return data.items[0];

}


/* =========================================================
   LIVE ARTIST STATISTICS
========================================================= */

app.get(
  "/api/stats",
  async (req, res) => {

    try {

      const channel =
        await getYouTubeChannel();


      const statistics =
        channel.statistics || {};


      /*
       * YouTube's statistics object provides:
       *
       * subscriberCount
       * viewCount
       * videoCount
       *
       * Some channels can have subscriber counts hidden.
       */


      res.json({

        youtubeSubscribers:
          statistics.hiddenSubscriberCount
            ? null
            : Number(
                statistics.subscriberCount || 0
              ),


        youtubeViews:
          Number(
            statistics.viewCount || 0
          ),


        youtubeVideos:
          Number(
            statistics.videoCount || 0
          ),


        /*
         * SoundCloud isn't being fabricated here.
         *
         * This stays null until we connect an authorized
         * SoundCloud data source.
         */

        soundcloudPlays:
          null,


        updatedAt:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(
        "Stats error:",
        error.message
      );


      res.status(500).json({

        error:
          "Unable to retrieve Wreal X statistics."

      });

    }

  }
);


/* =========================================================
   YOUTUBE VIDEO STATISTICS
========================================================= */

app.get(
  "/api/youtube/videos",
  async (req, res) => {

    const videoId =
      String(
        req.query.id || ""
      ).trim();


    if (!videoId) {

      return res.status(400).json({

        error:
          "Missing YouTube video ID."

      });

    }


    /*
     * Basic YouTube video ID validation.
     *
     * Prevents arbitrary URL-like input from being
     * passed to the API.
     */

    if (
      !/^[A-Za-z0-9_-]{6,20}$/.test(
        videoId
      )
    ) {

      return res.status(400).json({

        error:
          "Invalid YouTube video ID."

      });

    }


    try {

      const data =
        await youtubeRequest(
          "videos",
          {
            part: "statistics,snippet",
            id: videoId
          }
        );


      if (
        !data.items ||
        !data.items.length
      ) {

        return res.status(404).json({

          error:
            "YouTube video not found."

        });

      }


      const video =
        data.items[0];


      const statistics =
        video.statistics || {};


      res.json({

        videoId,

        title:
          video.snippet?.title || "",

        viewCount:
          Number(
            statistics.viewCount || 0
          ),

        likeCount:
          Number(
            statistics.likeCount || 0
          ),

        commentCount:
          Number(
            statistics.commentCount || 0
          ),

        updatedAt:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(
        "YouTube video error:",
        error.message
      );


      res.status(500).json({

        error:
          "Unable to retrieve YouTube video statistics."

      });

    }

  }
);


/* =========================================================
   WREAL X PROFILE DATA
========================================================= */

app.get(
  "/api/profile",
  async (req, res) => {

    try {

      const channel =
        await getYouTubeChannel();


      res.json({

        artist:
          "Wreal X",


        youtube: {

          channelId:
            channel.id || null,

          title:
            channel.snippet?.title || "Wreal X",

          description:
            channel.snippet?.description || "",

          subscribers:
            channel.statistics?.hiddenSubscriberCount
              ? null
              : Number(
                  channel.statistics?.subscriberCount || 0
                ),

          views:
            Number(
              channel.statistics?.viewCount || 0
            ),

          videos:
            Number(
              channel.statistics?.videoCount || 0
            )

        },


        streaming: {

          spotify:
            "https://open.spotify.com/artist/67HoDvLfnWWjCDLEIUbTAl",

          appleMusic:
            "https://music.apple.com/us/artist/wreal-x/1896590252",

          tidal:
            "https://tidal.com/artist/79457798/u",

          soundcloud:
            "https://soundcloud.com/wrealx",

          audiomack:
            "https://audiomack.com/@wrealx"

        },


        social: {

          x:
            "https://twitter.com/Wreal_X",

          facebook:
            "https://facebook.com/wrealxcursed",

          instagram:
            "https://instagram.com/wreal.x",

          tiktok:
            "https://tiktok.com/wreal_x"

        },


        updatedAt:
          new Date().toISOString()

      });


    } catch (error) {

      console.error(
        "Profile error:",
        error.message
      );


      res.status(500).json({

        error:
          "Unable to retrieve Wreal X profile."

      });

    }

  }
);


/* =========================================================
   CACHE HEADERS
========================================================= */

/*
 * Live numbers don't need to be cached for hours.
 *
 * We tell browsers/proxies that this API response is
 * short-lived.
 */

app.use(
  "/api",
  (req, res, next) => {

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60"
    );

    next();

  }
);


/* =========================================================
   404 API HANDLER
========================================================= */

app.use(
  "/api",
  (req, res) => {

    res.status(404).json({

      error:
        "Wreal X API endpoint not found."

    });

  }
);


/* =========================================================
   FRONTEND FALLBACK
========================================================= */

/*
 * If the server is hosting the complete website,
 * unknown non-API routes return index.html.
 */

app.get(
  "*",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "index.html"
      )
    );

  }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {

    console.error(
      "Server error:",
      error
    );


    res.status(500).json({

      error:
        "Something went wrong on the Wreal X server."

    });

  }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {

    console.log(
      "---------------------------------------------"
    );

    console.log(
      " WREAL X LIVE DATA SERVER"
    );

    console.log(
      "---------------------------------------------"
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `YouTube API: ${
        YOUTUBE_API_KEY
          ? "configured"
          : "NOT CONFIGURED"
      }`
    );

    console.log(
      "Artist: Wreal X"
    );

    console.log(
      "---------------------------------------------"
    );

  }
);
