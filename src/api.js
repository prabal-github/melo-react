const LOCAL_SERVER_URL = "http://localhost:9000"
export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI3MGMxNjA2ZC1jNzI2LTQ5YWYtYTgxYy03ZmY5YTE3Yzk2NWUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY2MzA5NTI3OCwiZXhwIjoxNjYzNzAwMDc4fQ.51lm7hOBbhlNhqjN_ruNVk4jB3g8b0lMeadglwxCEBA";


export const getToken = async () => {
  try {
    const response = await fetch(`${LOCAL_SERVER_URL}/get-token`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const { token } = await response.json();
    return token;
  } catch (e) {
    console.log(e);
  }
};

export const getMeetingId = async (token) => {
  try {
    const VIDEOSDK_API_ENDPOINT = `${LOCAL_SERVER_URL}/create-meeting`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    };
    const response = await fetch(VIDEOSDK_API_ENDPOINT, options)
      .then(async (result) => {
        const { meetingId } = await result.json();
        return meetingId;
      })
      .catch((error) => console.log("error", error));
    return response;
  } catch (e) {
    console.log(e);
  };
}

export const createMeeting = async ({ token }) => {
  const res = await fetch(`https://api.videosdk.live/v1/meetings`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ region: "sg001" }),
  });

  const { meetingId } = await res.json();
  return meetingId;
};











// const API_BASE_URL = process.env.SERVER_URL;
// const VIDEOSDK_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;
// const API_AUTH_URL = process.env.REACT_APP_AUTH_URL;
// export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI3MGMxNjA2ZC1jNzI2LTQ5YWYtYTgxYy03ZmY5YTE3Yzk2NWUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY2MzA4MTc2NywiZXhwIjoxNjYzNjg2NTY3fQ.4MD73a5DfqXSDrFZMpoTwAmSfZk4OYQF-trU2hMEfxI";

// export const getToken = async () => {
//   if (VIDEOSDK_TOKEN && API_AUTH_URL) {
//     console.error(
//       "Error: Provide only ONE PARAMETER - either Token or Auth API"
//     );
//   } else if (VIDEOSDK_TOKEN) {
//     return VIDEOSDK_TOKEN;
//   } else if (API_AUTH_URL) {
//     const res = await fetch(`${API_AUTH_URL}/get-token`, {
//       method: "GET",
//     });
//     const { token } = await res.json();
//     return token;
//   } else {
//     console.error("Error: ", Error("Please add a token or Auth Server URL"));
//   }
// };

// export const createMeeting = async ({ token }) => {
//   const url = `${API_BASE_URL}/api/meetings`;
//   const options = {
//     method: "POST",
//     headers: { Authorization: token, "Content-Type": "application/json" },
//   };

//   const { meetingId } = await fetch(url, options)
//     .then((response) => response.json())
//     .catch((error) => console.error("error", error));

//   return meetingId;
// };

// export const validateMeeting = async ({ meetingId, token }) => {
//   const url = `${API_BASE_URL}/api/meetings/${meetingId}`;

//   const options = {
//     method: "POST",
//     headers: { Authorization: token },
//   };

//   const result = await fetch(url, options)
//     .then((response) => response.json()) //result will have meeting id
//     .catch((error) => console.error("error", error));

//   return result ? result.meetingId === meetingId : false;
// };