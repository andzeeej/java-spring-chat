package com.neo.utils;

import com.corundumstudio.socketio.SocketIOClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionUtil {

    //Save all user :socket connections
    public static Map<String, SocketIOClient> userId_socket_Map = new ConcurrentHashMap<>();

}
