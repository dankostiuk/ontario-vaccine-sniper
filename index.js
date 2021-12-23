/**
 * Fast Vaccine Booker
 */

import fetch from 'node-fetch'

/**
 * CONFIG PARAMS ========================
 */

const CONFIG = 'd653da0a-113a-4c76-bf51-399bc164b1b6' // get this from URL config query param when logged in to main site
const CURR_DATE = '2021-12-22' // only search for appointments after this time
const LATEST_DATE = '2021-12-24' // only search for appointments up until this time
const LOCATION = { lat: 43.647469, lng: -79.3925303 } // my coordinates
const RADIUS = 50 // in km
const VACCINE_DATA = 'DyJhMWHdGXDDAwMDFFZHtBQUSiXQ==' // get this from viewing network tab request when viewing first `/locations` request

// get these fields from when logged in viewing network tab request when selecting an arbitrary timeslot
const RESERVE_RECAPTCHA =
  '04AGdBq26BEEtYwuJc22P8mh9e5Y0us76HdSf68UlSprLqSBEdQe4uoypczmnEvpZi7ngg2Y49IzKvGGb5Hk532XnJg8ouXUfrv1ZUK-VKGriO68i4tGU0rjzekxyvz5SkwNLERO2gg9NSP--AQYjCDpLlk1pWunk9NKpXvEK110dQ0StYy4F4OpsbFTnO7mbkvqKETSn2EE4YTSjyHjTJELtC1KUav5iz-yVYhB7wexl_upP5q4oClg7osDcGiB3kiBknPw2O-FWV7W7wojszvNBWw5rUI9L-anObp6ebum1Xq4TRRy_9H6JDFnWo_QBmYFmaiZSCQS-7wlV-N5rjXbxN6d9MC86ncNai2LLceZfvxJgcteqhDIbDWppvvOGC8L2EHha-Fe2TrZGHOcURkx2gU8ESJsbP1IO7Scrxu8661CfMVtGupPxm1-jzeX6Lw1omfo7-jWHWtP1R7xX5B3MxHA5qa2voq3fZtCQ0-S46CF-9zHo8XEeR6sYJcvEtrC6K_dfhhcraGCk-5RTTZauRWFDy7vza2E2a3zNsSeHQrkmgDtQF06-OI60tFVY9IiGYgDYCGt3884zBvVahw2DFyl7yCoFt2E1JfHrAtu47dfZA_Du4DMG-qNVABg2-G9bvTsqMs2yFFJ9iCxYPmdyZKVB-A90sGPi6AsSdCGt7hW_S7sTH3N8Lr1mJ3chdWwQNBAlpKQDxif3QXFtX_-WKHXqIERJz5KKYhmV18Y6Geebc8U2gq51I7wgAKupiPpaTH5HoK2WFvvylrxC2XHGa6B2LQFePzaSMsHz9CSQLuOazJriFFdx0xHFyDqKiJbZiLLco-qKgylD-30qjVsFdX9AoekkVLgX20ZvwMqhjUzowNWRcodtCLt-IP8E3hrGcK6xZOIUDzs8zU5Ys1NqjgnK2W7RTxsflUSGgyBVejnmIEFA_plHJ5NAFqogMC7qTFQaIQZ6r5VY2aOuMQmqVMl-JQOuie7jTCUU6SMyd-3VHdAfadIMr9LnvFVLMCkQg9OpqdO25DdYcRqHbXaH_zgIc7XkWIWIqjYcWPDlhg95qA5_EoOlXnBG1R-19GDuBcNJFi8zoaC6q54zMNt8FrdSWLpSwUipwM1EVHFAeqgvNLa_YyflThShBzuo4DFz_GrVIEELJXpudERSDF1nfyV52YBOia-S8c7wV1c69RJto2IzdgSNx7Z-mK491y0hTyS_01NCfQXWeteud-zq3fYKS6QzdDMMZ6sgD9XQuUESLCVu4Tlg'
const RESERVE_SESSION_ID = 'fc9421f5-7eee-48da-81b5-0426157a8e9b'

const FIRST_NAME = 'JOHN'
const LAST_NAME = 'DOE'
const EMAIL = 'jdoe@gmail.com'

/**
 * =====================================
 */

async function getLocations() {
  const locationBody = {
    location: LOCATION,
    fromDate: CURR_DATE,
    vaccineData: VACCINE_DATA,
    locationQuery: { includePools: ['default'], includeTags: [], excludeTags: ['a154t0000004hFFAAY'] },
    doseNumber: 2,
    groupSize: 1,
    limit: 200,
    cursor: '',
    locationType: 'CombinedBooking',
    filterTags: [],
    externalAppointments: [{ doseNumber: 1, start: '2021-09-01', isSingleDose: false }],
    radiusValue: RADIUS,
    radiusUnit: 'km',
    clientTimeZone: 'America/Toronto',
    url: 'https://vaccine.covaxonbooking.ca/location-select?config=' + CONFIG,
    timeZone: 'America/Toronto',
  }

  const locationRes = await fetch('https://api.covaxonbooking.ca/public/locations/search', {
    method: 'post',
    body: JSON.stringify(locationBody),
    headers: { 'Content-Type': 'application/json' },
  })

  const result = await locationRes.json()

  const locations = result.locations.map((e) => {
    return { name: e.name, extId: e.extId, regionExternalId: e.regionExternalId }
  })
  if (locations.length > 0) console.log('Got locations..')

  return locations
}

async function bookAppointmentInFirstAvailableSlot(locations) {
  const availBody = {
    startDate: CURR_DATE,
    endDate: LATEST_DATE,
    vaccineData: VACCINE_DATA,
    groupSize: 1,
    doseNumber: 2,
    url: 'https://vaccine.covaxonbooking.ca/appointment-select?config=' + CONFIG,
    timeZone: 'America/Toronto',
  }

  for (let location of locations) {
    const availRes = await fetch('https://api.covaxonbooking.ca/public/locations/' + location.extId + '/availability', {
      method: 'post',
      body: JSON.stringify(availBody),
      headers: { 'Content-Type': 'application/json' },
    })

    const availResResult = await availRes.json()

    const availableSlots = availResResult.availability.filter((e) => e.available && e.date !== CURR_DATE)

    if (availableSlots.length > 0) {
      const slotBody = {
        vaccineData: VACCINE_DATA,
        groupSize: 1,
        url: 'https://vaccine.covaxonbooking.ca/appointment-select?config=' + CONFIG,
        timeZone: 'America/Toronto',
      }

      const slotRes = await fetch('https://api.covaxonbooking.ca/public/locations/' + location.extId + '/date/' + availableSlots[0].date + '/slots', {
        method: 'post',
        body: JSON.stringify(slotBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const slotResResult = await slotRes.json()

      if (slotResResult.slotsWithAvailability.length > 0) {
        let reserveBody = {
          dose: 2,
          locationExtId: location.extId,
          date: availableSlots[0].date,
          localStartTime: slotResResult.slotsWithAvailability[0].localStartTime,
          vaccineData: VACCINE_DATA,
          recaptchaToken: RESERVE_RECAPTCHA,
          sessionId: RESERVE_SESSION_ID,
          groupSize: 1,
          url: 'https://vaccine.covaxonbooking.ca/appointment-select?config=' + CONFIG,
          timeZone: 'America/Toronto',
        }

        const reserveRes = await fetch(
          'https://api.covaxonbooking.ca/public/locations/' + location.extId + '/date/' + availableSlots[0].date + '/slots/reserve',
          {
            method: 'post',
            body: JSON.stringify(reserveBody),
            headers: { 'Content-Type': 'application/json' },
          }
        )
        const reserveResResult = await reserveRes.json()

        let reseravtionId = reserveResResult.reservationIds[0]

        let appointmentBody = {
          eligibilityQuestionResponse: [],
          type: 'individual-booking',
          personalDetails: [
            { id: 'q.patient.firstname', value: FIRST_NAME, type: 'text' },
            { id: 'q.patient.lastname', value: LAST_NAME, type: 'text' },
            { id: 'q.patient.email', value: EMAIL, type: 'email' },
            { id: 'q.patient.mobile', type: 'mobile-phone' },
          ],
          additionalQuestionsResponse: [
            { id: 'q.patient.proxy.section.hideshow', value: 'No', type: 'single-select' },
            { id: 'q.patient.desc.proxy.name', type: 'text' },
            { id: 'q.patient.desc.proxy.phone', type: 'text' },
            { id: 'q.patient.desc.relationship.to.the.client', type: 'single-select' },
          ],
          reservationIds: [reseravtionId],
          locale: 'en_CA',
          externalAppointments: [{ doseNumber: 1, start: '2021-09-01', isSingleDose: false }],
          url: 'https://vaccine.covaxonbooking.ca/additional-information?config=' + CONFIG,
          timeZone: 'America/Toronto',
        }

        const appointmentRes = await fetch('https://api.covaxonbooking.ca/public/appointments', {
          method: 'post',
          body: JSON.stringify(appointmentBody),
          headers: { 'Content-Type': 'application/json' },
        })
        const result = await appointmentRes.json()
        return result
      }
    }
  }
}

while (true) {
  const locations = await getLocations()
  const appointment = await bookAppointmentInFirstAvailableSlot(locations)
  if (appointment !== undefined) {
    console.log('Booked: ' + JSON.stringify(appointment))
    break
  }
}
