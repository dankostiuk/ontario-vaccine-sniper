# Ontario Vaccine Sniper

> Quickly and conveniently book yourself the nearest and earliest possible COVID-19 vaccine appointment.

This tool finds and books the nearest and earliest possible COVID-19 vaccine appointment given the configuration parameters you set. After getting frustrated with not being able to find a convenient appointment using https://covid19.ontariohealth.ca/, I decided to write up this tool for friends and family.

Remember that you can always book another appointment as it will replace the most recent appointment already booked.

## Requirements

- Install `node` and `npm`

## Setting Up

1. Clone this git repo
2. Run `npm i` in this directory
3. Fill out 'CONFIG PARAMS' section (see steps below) in index.js and save the file
4. Run `npm start` - you should get an email when an appointment has been booked

## Configuration Steps

1. Go to https://covid19.ontariohealth.ca/ and follow steps to book vaccine appointment (enter green healthcared info, etc).
2. Get 'config' value from URL textfield (should look similar to `d653da0a-113a-4c76-bf51-399bc164b1b6`) - set this value for CONFIG in index.js
3. Open up Network tab in Chrome Developer tools and view `/locations` request payload to get vaccine_data field (should look similar to `DyJhMWHdGXDDAwMDFFZHtBQUSiXQ=` for `/locations` request) - set this value for VACCINE_DATA in index.js
4. As you are allowed to book multiple times (your latest booking will be replaced by subsequent bookings), try to find an available appointment to book and have Network tab open during this process
   1. Note down the recaptcha field found in payload when reserving a slot - set this value for RESERVE_RECAPTCHA
   2. Note down session_id found in payload when reserving a slot - set this value for RESERVE_SESSION_ID
5. Fill out details:
   - CURR_DATE - today's current date
   - LATEST_DATE - the latest date you are willing to book an appointment for
   - LOCATION - your coordinates, you can use Google to get this
   - RADIUS - max distance in km you are willing to travel to
   - FIRST_NAME, LAST_NAME, EMAIL
