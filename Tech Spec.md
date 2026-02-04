
Website URL: https://white-carrot-test-57vh.vercel.app
API : https://whitecarrottest.onrender.com

Assumptions: 

Architecture:
The repository is monorepo with a clear frontend / backend split.

Frontend :
React 19 (Vite)
Tailwind for styling, AuthContext for, well obviously auth context. 
2 sides : 
Recruiter has dashboard
Can add (sample jobs for new company entries), delete and view their own jobs, and the requested Career page editor with preview section on the side (along with a preview page): The editor has the following sections : Hero Banner, Text Blocks, image gallery, video, Job listings, CTA, Custom html section. Design section in the editor has theme presets, typography + spacing settings.
Profile section stores logo + banners, social links.
Advanced section has custom css with reference points.



Backend : Node.js, Express, MongoDB Atlas, JWT-based authentication, (Locally stored images for now)
Standard controller - routes - models structure 
Added a script to enter Sample companies.
Recruiter Logs in with email pass (stored in db with email, hashed pw)
Company: name and url slug, media, theme settings, list of sections in order
Sections are in types (hero, text, gallery, etc ) 
Jobs, are in teh same structure as the given sample data 


Test Plans : Each module was tested while integration and every prior module was tested with regression testing to ensure no production errors.

Schema: 
Companies they store data like this for easy fetching and unnecessary indexing: 
{
  "_id": {
    "$oid": "6981e452e62d4fbddfccbe96"
  },
  "name": "TechCorp Global",
  "slug": "techcorp-global",
  "recruiterId": {
    "$oid": "6981e452e62d4fbddfccbe94"
  },
  "theme": {
    "primaryColor": "#18181B",
    "secondaryColor": "#3F3F46",
    "accentColor": "#71717A",
    "backgroundColor": "#fafafa",
    "textColor": "#1F2937",
    "fontFamily": "Playfair Display, serif",
    "headingFont": "Georgia, serif",
    "baseFontSize": "14px",
    "borderRadius": "0.25rem",
    "spacing": "compact",
    "buttonStyle": "minimal",
    "logoUrl": "",
    "bannerUrl": "",
    "preset": "minimal",
    "customCSS": ""
  },
  "content": {
    "heroTitle": "Build the Future with Us",
    "heroSubtitle": "Join our innovative team and shape tomorrow's technology"
  },
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "Build the Future with Ussss",
      "subtitle": "Join our innovative team and shape tomorrow's technology",
      "content": "",
      "enabled": true,
      "order": 0,
      "config": {
        "imageUrls": [],
        "images": [],
        "layout": "center",
        "backgroundType": "image",
        "backgroundImageUrl": "/uploads/6981e452e62d4fbddfccbe94/image-1770217167260-65588114.jpg",
        "overlayOpacity": 0.4
      }
    },
    {
      "id": "jobs",
      "type": "jobs",
      "title": "Open Positions",
      "subtitle": "Find your next opportunity",
      "content": "",
      "enabled": true,
      "order": 1
    },
    {
      "id": "video-1770143090227",
      "type": "video",
      "title": "Our Story",
      "subtitle": "",
      "content": "",
      "enabled": true,
      "order": 2,
      "config": {
        "videoUrl": "https://www.youtube.com/embed/kIhb5pEo_j0?si=u6LIYE-ev1fw5guF",
        "imageUrls": [],
        "images": [],
        "layout": "center",
        "backgroundType": "image",
        "overlayOpacity": 0.4
      }
    },
    {
      "id": "gallery-1770133215972",
      "type": "gallery",
      "title": "Our Team",
      "subtitle": "",
      "content": "",
      "enabled": true,
      "order": 3,
      "config": {
        "imageUrls": [
          "/uploads/6981e452e62d4fbddfccbe94/image-1770217149138-738721545.png",
          "/uploads/6981e452e62d4fbddfccbe94/image-1770217149242-402456088.png",
          "/uploads/6981e452e62d4fbddfccbe94/image-1770217149366-551021140.png"
        ],
        "images": [
          {
            "url": "/uploads/6981e452e62d4fbddfccbe94/image-1770217149138-738721545.png",
            "caption": ""
          },
          {
            "url": "/uploads/6981e452e62d4fbddfccbe94/image-1770217149242-402456088.png",
            "caption": ""
          },
          {
            "url": "/uploads/6981e452e62d4fbddfccbe94/image-1770217149366-551021140.png",
            "caption": ""
          }
        ],
        "layout": "center",
        "backgroundType": "image",
        "overlayOpacity": 0.4
      }
    },
    {
      "id": "",
      "type": "cta",
      "title": "",
      "subtitle": "",
      "content": "",
      "enabled": boolean,
      "order": 4,
      "config": {
        "imageUrls": [],
        "images": [],
        "ctaButtonText": "",
        "ctaButtonUrl": "",
        "layout": "center",
        "backgroundType": "image",
        "overlayOpacity": 0.4
      }
    },
    {
      "id": "custom-1770143690554",
      "type": "custom",
      "title": "Custom Section",
      "subtitle": "",
      "content": "",
      "enabled": boolean,
      "order": int,
      "config": {
        "imageUrls": [],
        "images": [],
        "layout": "center",
        "backgroundType": "image",
        "overlayOpacity": 0.4
      }
    }
  ],
  "createdAt": {
    "$date": "2026-02-03T12:04:34.675Z"
  },
  "updatedAt": {
    "$date": "2026-02-04T20:50:14.433Z"
  },
  "__v": 9,
  "bannerUrl": "",
  "description": "",
  "logoUrl": "",
  "socialLinks": {
    "linkedin": "",
    "twitter": "",
    "instagram": "",
    "facebook": "",
    "youtube": "",
    "website": ""
  }
}

Recruiter (user): 
{
  "_id": {
    "$oid": "6983692d0398d1bcf8324063"
  },
  "email": "yeki@dev.com",
  "passwordHash": "$2b$10$lqtgD5turBnr7s095HoMo.MoevZu6jnXZG2C50TTU/cdJb3mmEZxi",
  "createdAt": {
    "$date": "2026-02-04T15:43:41.683Z"
  },
  "__v": 0
}