import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import server from '../environment';
import '../App.css';

const server_url = server;

const connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState(() => localStorage.getItem('ZOOMOOM_NAME') || localStorage.getItem('ZOOMOOM_USER') || 'Guest');
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);

  const getPermissions = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null);
        setVideoAvailable(Boolean(videoPermission));

        const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        setAudioAvailable(Boolean(audioPermission));
      }

      setScreenAvailable(Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
    } catch (error) {
      console.log(error);
    }
  };

  const getDislayMedia = () => {
    if (screen && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDislayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }

    Object.keys(connections).forEach((id) => {
      if (id === socketIdRef.current) return;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
          })
          .catch((e) => console.log(e));
      });
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          const tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((item) => item.stop());
        } catch (e) {
          console.log(e);
        }

        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoref.current) {
          localVideoref.current.srcObject = window.localStream;
        }

        Object.keys(connections).forEach((id) => {
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
              })
              .catch((e) => console.log(e));
          });
        });
      };
    });
  };

  const getUserMedia = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video && videoAvailable, audio: audio && audioAvailable })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        if (localVideoref.current && localVideoref.current.srcObject) {
          localVideoref.current.srcObject.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getDislayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }

    Object.keys(connections).forEach((id) => {
      if (id === socketIdRef.current) return;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
          })
          .catch((e) => console.log(e));
      });
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);
        try {
          if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getTracks().forEach((item) => item.stop());
          }
        } catch (e) {
          console.log(e);
        }

        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoref.current) {
          localVideoref.current.srcObject = window.localStream;
        }

        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === 'offer') {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
      }
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on('chat-message', addMessage);

      socketRef.current.on('user-left', (id) => {
        setVideos((currentVideos) => currentVideos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on('user-joined', (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            const videoExists = videoRef.current.find((video) => video.socketId === socketListId);

            if (videoExists) {
              setVideos((currentVideos) =>
                currentVideos.map((video) =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video,
                ),
              );
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((currentVideos) => {
                const updatedVideos = [...currentVideos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          Object.keys(connections).forEach((id2) => {
            if (id2 === socketIdRef.current) return;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {
              console.log(e);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit('signal', id2, JSON.stringify({ sdp: connections[id2].localDescription }));
                })
                .catch((e) => console.log(e));
            });
          });
        }
      });
    });
  };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => {
    setVideo((currentState) => !currentState);
  };

  const handleAudio = () => {
    setAudio((currentState) => !currentState);
  };

  const handleScreen = () => {
    setScreen((currentState) => !currentState);
  };

  const handleEndCall = () => {
    try {
      if (localVideoref.current && localVideoref.current.srcObject) {
        localVideoref.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }
    window.location.href = '/home';
  };

  const openChat = () => {
    setModal(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setModal(false);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data, isSelf: socketIdSender === socketIdRef.current }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit('chat-message', message, username || 'Guest');
    setMessages((prevMessages) => [...prevMessages, { sender: username || 'You', data: message, isSelf: true }]);
    setMessage('');
  };

  const connect = () => {
    setAskForUsername(false);
    setUsername(username || 'Guest');
    getMedia();
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const activeSpeakerClass = videos.length > 0 ? 'active-speaker' : '';
  const meetingCode = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'Guest room';

  return (
    <div className="meeting-page">
      {askForUsername ? (
        <div className="lobby-shell">
          <div className="lobby-card">
            <div className="lobby-header">
              <div className="brand-mark" style={{ fontSize: '1.6rem' }}>
                <span className="brand-mark__icon" aria-hidden="true" />
                ZOOMOOM
              </div>
              <button type="button" className="ghost-button" onClick={() => (window.location.href = '/home')}>
                Back to dashboard
              </button>
            </div>

            <div className="lobby-body">
              <div className="preview-stage">
                {videoAvailable ? (
                  <video ref={localVideoref} autoPlay muted playsInline />
                ) : (
                  <div className="preview-placeholder">Camera unavailable</div>
                )}
              </div>

              <div className="lobby-panel">
                <div>
                  <p className="field-label">Meeting</p>
                  <h2 style={{ fontSize: '2.2rem', letterSpacing: '-0.05em', marginTop: '8px' }}>{meetingCode}</h2>
                </div>

                <div className="form-section">
                  <label className="field-label" htmlFor="username-field">
                    Your name
                  </label>
                  <input
                    id="username-field"
                    className="lobby-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="device-row">
                  <button
                    type="button"
                    className={`device-toggle ${audio ? 'on' : ''}`}
                    onClick={handleAudio}
                    aria-label="Toggle microphone"
                  >
                    <span>Microphone</span>
                    <span>{audio ? 'On' : 'Off'}</span>
                  </button>

                  <button
                    type="button"
                    className={`device-toggle ${video ? 'on' : ''}`}
                    onClick={handleVideo}
                    aria-label="Toggle camera"
                  >
                    <span>Camera</span>
                    <span>{video ? 'On' : 'Off'}</span>
                  </button>
                </div>

                <div className="meeting-mini-stats">
                  <div className="meta-box">
                    <span>Audio</span>
                    <strong>{audioAvailable ? 'Ready' : 'Blocked'}</strong>
                  </div>
                  <div className="meta-box">
                    <span>Video</span>
                    <strong>{videoAvailable ? 'Ready' : 'Blocked'}</strong>
                  </div>
                </div>

                <button type="button" className="primary-button" onClick={connect} style={{ width: '100%' }}>
                  Join meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="meeting-shell">
          <div className="meeting-topbar">
            <div className="brand-mark" style={{ fontSize: '1.2rem' }}>
              <span className="brand-mark__icon" aria-hidden="true" />
              ZOOMOOM
            </div>

            <div className="meeting-info">
              <span className="status-dot" aria-hidden="true" />
              <span>{meetingCode}</span>
            </div>

            <div className="meeting-actions">
              <button type="button" className="secondary-button" onClick={() => setShowParticipants((state) => !state)}>
                Participants
              </button>
              <button type="button" className="ghost-button" onClick={() => setModal((state) => !state)}>
                Chat
              </button>
            </div>
          </div>

          <div className="meeting-main">
            <div className="meeting-stage">
              <div
                className={`video-grid ${videos.length <= 1 ? 'video-grid--single' : videos.length === 2 ? 'video-grid--double' : 'video-grid--compact'}`}
              >
                <div className={`video-tile ${!video ? 'camera-off' : ''} ${activeSpeakerClass}`}>
                  <video ref={localVideoref} className="video-element" autoPlay muted playsInline />

                  {!video && (
                    <div className="tile-content">
                      <div className="tile-header">
                        <span className="tile-badge">You</span>
                        <span className="mic-state">{audio ? 'Mic on' : 'Mic off'}</span>
                      </div>

                      <div className="tile-placeholder">
                        <div className="tile-avatar">{(username || 'You').slice(0, 1).toUpperCase()}</div>
                      </div>

                      <div className="tile-footer">
                        <span className="tile-label">{username || 'Guest'}</span>
                        <span className="tile-label">{video ? 'Camera on' : 'Camera off'}</span>
                      </div>
                    </div>
                  )}

                  {video && (
                    <div className="tile-content" style={{ pointerEvents: 'none' }}>
                      <div className="tile-header">
                        <span className="tile-badge">You</span>
                        <span className="mic-state">{audio ? 'Mic on' : 'Mic off'}</span>
                      </div>

                      <div className="tile-footer">
                        <span className="tile-label">{username || 'Guest'}</span>
                        <span className="tile-label">Live</span>
                      </div>
                    </div>
                  )}
                </div>

                {videos.map((videoItem) => (
                  <div key={videoItem.socketId} className="video-tile active-speaker">
                    <video
                      data-socket={videoItem.socketId}
                      className="video-element"
                      ref={(ref) => {
                        if (ref && videoItem.stream) {
                          ref.srcObject = videoItem.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                    />

                    <div className="tile-content" style={{ pointerEvents: 'none' }}>
                      <div className="tile-header">
                        <span className="tile-badge">Guest</span>
                        <span className="mic-state">Mic on</span>
                      </div>

                      <div className="tile-footer">
                        <span className="tile-label">Participant</span>
                        <span className="tile-label">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showModal && (
              <aside className="meeting-panel chat-panel" aria-label="Chat panel">
                <div className="panel-header">
                  <h3>Chat</h3>
                  <button type="button" className="ghost-button" onClick={closeChat}>
                    Close
                  </button>
                </div>

                <div className="panel-body">
                  {messages.length > 0 ? (
                    <div className="message-list">
                      {messages.map((item, index) => (
                        <div key={`${item.sender}-${index}`} className={`message-bubble ${item.isSelf ? 'self' : ''}`}>
                          <strong>{item.sender}</strong>
                          <p>{item.data}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-message">No messages yet. Start the conversation.</div>
                  )}
                </div>

                <div className="chat-composer">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Type a message"
                  />
                  <button type="button" className="primary-button send-button" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </aside>
            )}

            {showParticipants && (
              <aside className="meeting-panel" aria-label="Participants panel">
                <div className="panel-header">
                  <h3>Participants</h3>
                  <button type="button" className="ghost-button" onClick={() => setShowParticipants(false)}>
                    Close
                  </button>
                </div>

                <div className="participants-list">
                  <div className="participant-row">
                    <div className="participant-main">
                      <div className="avatar">{(username || 'Y').slice(0, 1).toUpperCase()}</div>
                      <div>
                        <strong>{username || 'Guest'}</strong>
                        <div className="participant-status">
                          <span>{audio ? 'Mic on' : 'Mic off'}</span>
                          <span>•</span>
                          <span>{video ? 'Camera on' : 'Camera off'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="status-pill">Host</span>
                  </div>

                  {videos.map((videoItem, index) => (
                    <div className="participant-row" key={`${videoItem.socketId}-${index}`}>
                      <div className="participant-main">
                        <div className="avatar">P</div>
                        <div>
                          <strong>Participant {index + 1}</strong>
                          <div className="participant-status">
                            <span>Mic on</span>
                            <span>•</span>
                            <span>Video on</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>

          <div className="meeting-controls">
            <div className="control-bar" aria-label="Meeting controls">
              <button
                type="button"
                className={`control-button ${audio ? 'active' : 'off'}`}
                onClick={handleAudio}
                aria-label={audio ? 'Mute microphone' : 'Unmute microphone'}
                title={audio ? 'Mute microphone' : 'Unmute microphone'}
              >
                {audio ? 'Mic' : 'Mic off'}
              </button>

              <button
                type="button"
                className={`control-button ${video ? 'active' : 'off'}`}
                onClick={handleVideo}
                aria-label={video ? 'Turn off camera' : 'Turn on camera'}
                title={video ? 'Turn off camera' : 'Turn on camera'}
              >
                {video ? 'Cam' : 'Cam off'}
              </button>

              {screenAvailable && (
                <button
                  type="button"
                  className={`control-button ${screen ? 'active' : ''}`}
                  onClick={handleScreen}
                  aria-label={screen ? 'Stop screen share' : 'Start screen share'}
                  title={screen ? 'Stop screen share' : 'Start screen share'}
                >
                  {screen ? 'Stop share' : 'Share'}
                </button>
              )}

              <button
                type="button"
                className={`control-button ${showParticipants ? 'active' : ''}`}
                onClick={() => setShowParticipants((state) => !state)}
                aria-label="Toggle participants panel"
                title="Participants"
              >
                People
              </button>

              <button
                type="button"
                className={`control-button ${showModal ? 'active' : ''}`}
                onClick={showModal ? closeChat : openChat}
                aria-label="Toggle chat panel"
                title="Chat"
              >
                Chat
              </button>

              <button type="button" className="control-button danger" aria-label="More controls" title="More options">
                More
              </button>

              <button type="button" className="control-button leave" onClick={handleEndCall} aria-label="Leave meeting" title="Leave meeting">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
