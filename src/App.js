import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Col, Row } from 'react-simple-flex-grid'
import { MicrophoneIcon } from '@heroicons/react/24/solid'

import {
  MeetingConsumer,
  MeetingProvider,
  useMeeting,
  useParticipant
} from '@videosdk.live/react-sdk'

import { createMeeting, getToken } from "./api";

const chunk = (arr) => {
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 3));
  return newArr;
}

function JoinScreen({ getMeetingAndToken, updateMeetingId }) {
  return (
    <div className="flex justify-center items-center p-10 gap-3">
      <input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          updateMeetingId(e.target.value);
        }}
        className='border-2 p-3 rounded'
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getMeetingAndToken}>Join</button>
      {" or "}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getMeetingAndToken}>Create Meeting</button>
    </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  return (
    <div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={leave}>Leave</button>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleMic}>toggleMic</button>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleWebcam}>toggleWebcam</button>
    </div>
  );
}

const ParticipantView = (props) => {
  const webcamRef = useRef(null);
  const micRef = useRef(null);
  const screenShareRef = useRef(null);

  const {
    // displayName,
    webcamStream,
    micStream,
    screenShareStream,
    webcamOn,
    micOn,
    screenShareOn
  } = useParticipant(props.participantId);

  useEffect(() => {
    if (webcamRef.current) {
      if (webcamOn && webcamStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);

        webcamRef.current.srcObject = mediaStream;
        webcamRef.current
          .play()
          .catch((error) => console.error("mic  play() failed", error));
      }
      else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn])

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error("mic  play() failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  useEffect(() => {
    if (screenShareRef.current) {
      if (screenShareOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);

        screenShareRef.current.srcObject = mediaStream;
        screenShareRef.current
          .play()
          .catch((error) => console.error("mic  play() failed", error));
      } else {
        screenShareRef.current.srcObject = null;
      }
    }
  }, [screenShareStream, screenShareOn]);

  return (
    <div className="flex flex-col gap-8 my-5" key={props.participantId}>
      <audio ref={micRef} autoPlay />
      {webcamRef || micOn ? (
        <div className="border-2 p-3 text-center rounded shadow-2xl">
          <h2 className="mb-3 text-2xl font-semibold">Web Cam View</h2>
          <video
            height={"100%"}
            width={"100%"}
            ref={webcamRef}
            autoPlay
          />
        </div>
      ) : null}

      {screenShareOn ? (
        <div className="border-2 p-5 text-center rounded shadow-2xl">
          <h2 className="mb-5 text-2xl font-semibold">Screen Shared</h2>
          <video
            height={"100%"}
            width={"100%"}
            ref={screenShareRef}
            autoPlay
          />
        </div>
      ) : null}

      <br/>
    </div>
  )


}

function MeetingGrid(props) {
  const [joined, setJoined] = useState(false);
  const { join, leave, toggleMic, toggleWebcam, toggleScreenShare } = useMeeting();
  const { participants } = useMeeting();
  const joinMeeting = () => {
    setJoined(true);
    join();
  };
  return (
    <div className="flex justify-center items-center p-10 gap-3 flex-col">
      <header className="text-3xl font-bold">Meeting ID: {props.meetingId}</header>
      {joined ?
        (
          <div className="flex gap-2">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={leave}>Leave</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleMic}>toggleMic</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleWebcam}>toggleWebcam</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleScreenShare}>toggleScreenShare</button>
          </div>
        )
        :
        (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"onClick={joinMeeting}>Join</button>
        )
      }

      <div>
        {chunk([...participants.keys()]).map((k) => (
          <Row key={k} gutter={80}>
            {k.map((l) => (
              <Col span={4}>
                <ParticipantView key={l} participantId={l} />
              </Col>
            ))}
          </Row>
        ))}
      </div>

    </div>
  );
}

function Container(props) {
  const [joined, setJoined] = useState(false);
  const { join } = useMeeting();
  const { participants } = useMeeting();
  const joinMeeting = () => {
    setJoined(true);
    join();
  };

  return (
    <div className="container flex justify-center items-center flex-col">
      <h3>Meeting Id: {props.meetingId}</h3>
      {joined ? (
        <div>
          <Controls />
          {[...participants.keys()].map((participantId) => (
            <VideoComponent participantId={participantId} key={participantId} />
          ))}
        </div>
      ) : (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button>
      )}
    </div>
  );
}

function VideoComponent(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn } = useParticipant(
    props.participantId
  );

  const videoStream = useMemo(() => {
    if (webcamOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div key={props.participantId}>
      {micOn && micRef && <audio ref={micRef} autoPlay />}
      {webcamOn && (
        <ReactPlayer
          //
          playsinline // very very imp prop
          pip={false}
          light={false}
          controls={true}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"100px"}
          width={"100px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(null)
  const [meetingId, setMeetingId] = useState(null);

  const getMeetingAndToken = async (id) => {
    const token = await getToken();
    setToken(token);
    setMeetingId(meetingId ? meetingId : (await createMeeting({ token })));
  };

  const updateMeetingId = (meetingId) => {
    setMeetingId(meetingId);
  }

  return token && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: false,
        name: "C.V. Raman",
      }}
      token={token}
    >
      <MeetingConsumer>
        {/* {() => <Container me0etingId={meetingId} getMeetingAndToken={getMeetingAndToken} />} */}
        {() => <MeetingGrid meetingId={meetingId} getMeetingAndToken={getMeetingAndToken} />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} updateMeetingId={updateMeetingId} />
  );
}

export default App;




// import { useEffect, useMemo, useRef, useState } from "react";
// import { getMeetingId, getToken } from "./api";
// function App() {
//   const [token, setToken] = useState(null);
//   const [meetingId, setMeetingId] = useState(null);
//   const getMeetingToken = async () => {
//     const token = await getToken();
//     setToken(token);
//     const ID = await getMeetingId(token);
//     console.log("Id", ID);
//     setMeetingId(ID);
//   };
//   console.log("meetingId", meetingId);
//   useEffect(() => {
//     getMeetingToken();
//   }, []);
//   return token ? (<h1>{meetingId}</h1>) : null;
// }
// export default App;
