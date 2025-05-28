"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Users, FileText, Download, Moon, Sun } from "lucide-react";
import { socket } from "./lib/socket.io";
import { Logo } from "./Components/Logo";


export default function App() {
  const [ roomId, setRoomId ] = useState( "" );
  const [ inRoom, setInRoom ] = useState( false );
  const [ isCreator, setIsCreator ] = useState( false );
  const [ messages, setMessages ] = useState( [] );
  const [ darkMode, setDarkMode ] = useState( false );
  const fileInputRef = useRef( null );
  const messagesEndRef = useRef( null );

  // Initialize dark mode from system preference or localStorage
  useEffect( () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem( "theme" );
    if ( savedTheme ) {
      setDarkMode( savedTheme === "dark" );
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia( "(prefers-color-scheme: dark)" ).matches;
      setDarkMode( prefersDark );
    }
  }, [] );

  // Apply dark mode class to document
  useEffect( () => {
    if ( darkMode ) {
      document.documentElement.classList.add( "dark" );
    } else {
      document.documentElement.classList.remove( "dark" );
    }
    // Save preference to localStorage
    localStorage.setItem( "theme", darkMode ? "dark" : "light" );
  }, [ darkMode ] );

  // Socket connection and event handlers
  useEffect( () => {
    socket.connect();

    const handleReceiveFile = ( { file, senderId } ) => {
      setMessages( ( prev ) => [ ...prev, { type: "file", data: file, from: senderId } ] );
    };

    const handleUserJoined = ( userId ) => {
      setMessages( ( prev ) => [ ...prev, { type: "system", message: `User ${ userId } joined the room.` } ] );
    };

    socket.on( "receive-file", handleReceiveFile );
    socket.on( "user-joined", handleUserJoined );

    return () => {
      socket.off( "receive-file", handleReceiveFile );
      socket.off( "user-joined", handleUserJoined );
      socket.disconnect();
    };
  }, [] );

  // Auto-scroll to bottom when new messages arrive
  useEffect( () => {
    messagesEndRef.current?.scrollIntoView( { behavior: "smooth" } );
  }, [ messages ] );

  const toggleDarkMode = () => {
    setDarkMode( !darkMode );
  };

  const createRoom = () => {
    if ( !roomId.trim() ) {
      alert( "Please enter a room ID" );
      return;
    }
    socket.emit( "create-room", roomId );
    setInRoom( true );
    setIsCreator( true );
  };

  const joinRoom = () => {
    if ( !roomId.trim() ) {
      alert( "Please enter a room ID" );
      return;
    }
    socket.emit( "join-room", roomId, ( response ) => {
      if ( response.success ) {
        setInRoom( true );
        setIsCreator( false );
      } else {
        alert( response.message );
      }
    } );
  };

  const sendFile = ( e ) => {
    const file = e.target.files?.[ 0 ];
    if ( !file ) return;

    const reader = new FileReader();
    reader.onload = ( evt ) => {
      const base64File = evt.target?.result;
      socket.emit( "send-file", { roomId, file: { name: file.name, data: base64File } } );
      setMessages( ( prev ) => [ ...prev, { type: "file", data: { name: file.name, data: base64File }, from: "You" } ] );
    };
    reader.readAsDataURL( file );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo and Dark Mode Toggle */ }
        <div className="flex justify-between items-center mb-6">
          <Logo size={ 38 } />
          <button
            onClick={ toggleDarkMode }
            className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-200"
            aria-label={ darkMode ? "Switch to light mode" : "Switch to dark mode" }
          >
            { darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" /> }
          </button>
        </div>

        { !inRoom ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 transition-colors duration-300">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                File Share
              </h1>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
                Create or join a room to start sharing files
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300"
                >
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  placeholder="Enter room ID"
                  value={ roomId }
                  onChange={ ( e ) => setRoomId( e.target.value ) }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-slate-900 dark:text-white bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={ createRoom }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  Create Room
                </button>
                <button
                  onClick={ joinRoom }
                  className="flex-1 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Room Header */ }
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                    Room: { roomId }
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-300">
                    { isCreator ? "You are the room creator" : "Connected as participant" }
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium transition-colors duration-300">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  Connected
                </div>
              </div>
            </div>

            {/* File Upload Section */ }
            { isCreator && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">
                  Share Files
                </h3>
                <div
                  onClick={ triggerFileInput }
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer group"
                >
                  <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mx-auto mb-4 transition-colors duration-200" />
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors duration-200">
                    Click to select a file to share
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 transition-colors duration-200">
                    Files will be shared with all room participants
                  </p>
                </div>
                <input type="file" ref={ fileInputRef } onChange={ sendFile } className="hidden" />
              </div>
            ) }

            {/* Messages Area */ }
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">
                  Activity
                </h3>
              </div>
              <div className="h-80 overflow-y-auto p-6 space-y-4">
                { messages.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 transition-colors duration-300" />
                    <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">No activity yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 transition-colors duration-300">
                      { isCreator ? "Share a file to get started" : "Waiting for files to be shared" }
                    </p>
                  </div>
                ) : (
                  messages.map( ( msg, i ) => {
                    if ( msg.type === "system" ) {
                      return (
                        <div key={ i } className="flex items-center gap-3 py-2">
                          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full transition-colors duration-300"></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                            { msg.message }
                          </span>
                        </div>
                      );
                    } else if ( msg.type === "file" && msg.data ) {
                      return (
                        <div
                          key={ i }
                          className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 transition-colors duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900 dark:text-white transition-colors duration-300">
                                  { msg.from }
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                                  shared a file
                                </span>
                              </div>
                              <a
                                href={ msg.data.data }
                                download={ msg.data.name }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 group"
                              >
                                <span className="truncate !whitespace-normal">{ msg.data.name }</span>
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  } )
                ) }
                <div ref={ messagesEndRef } />
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  );
}
