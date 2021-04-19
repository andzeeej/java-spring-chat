package com.neo.socketio;

import com.alibaba.fastjson.JSONObject;
import com.corundumstudio.socketio.*;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.google.protobuf.InvalidProtocolBufferException;
import com.neo.entity.*;
import com.neo.serivce.AddMessageSerivice;
import com.neo.serivce.ChatSerivice;
import com.neo.serivce.GroupSerivice;
import com.neo.serivce.UserSerivice;
import com.neo.utils.DateUtils;
import com.neo.utils.SessionUtil;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.List;



@Component
public class MessageEventHandler {

    private final SocketIOServer server;

    private Logger logger = LogManager.getLogger(getClass().getName());

    @Autowired
    UserSerivice userSerivice;

    @Autowired
    ChatSerivice chatSerivice;

    @Autowired
    GroupSerivice groupSerivice;

    @Autowired
    AddMessageSerivice addMessageSerivice;


    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS");

    @Autowired
    public MessageEventHandler(SocketIOServer server) {
        this.server = server;
    }

    //Add the connect event, which is called when the client initiates the connection.
    //In this article, the clientid and sessionid are stored in the database.
    //It is convenient to find the corresponding target client when sending the message later.
    @OnConnect
    public void onConnect(SocketIOClient client) {
        HandshakeData hd = client.getHandshakeData();

        String auth_token = hd.getSingleUrlParam("auth_token");
        UserEntity userEntity = userSerivice.findUserByToken(auth_token);
        String userId = userEntity.getId();
        String userName = userEntity.getUsername();
        client.set("userId", userId);
        client.set("userName", userName);
        SessionUtil.userId_socket_Map.put(userId, client);

        //The group where the online association is located
        List<GroupEntity> entityList = groupSerivice.findMyGroupsByUserId(userId);

        for (GroupEntity entity : entityList) {
            logger.info(userName + "Automatically associated groups " + entity.getGroupname() + "   " + sdf.format(new Date()));
            client.joinRoom(entity.getId());
        }

        logger.info(userName + "----> " + client.getSessionId() + "   " + sdf.format(new Date()));
    }


    //Add the @OnDisconnect event, which is called when the client disconnects, refreshing the client information.
    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        SessionUtil.userId_socket_Map.remove(client.get("userId"));
        logger.info(client.get("userName") + "---------》going offline " + sdf.format(new Date()));
    }


    //Test the transmitted data with protobuf
    @OnEvent(value = "protobufTest")
    public void onProtobufTest(SocketIOClient client, AckRequest ackRequest, byte[] data) throws InvalidProtocolBufferException, UnsupportedEncodingException {
        if (ackRequest.isAckRequested()) {
            ackRequest.sendAckData(data);
        }
        GpsData.gps_data gps_data = GpsData.gps_data.parseFrom(data);
        System.out.println("after :" + gps_data.getTerminalId() + gps_data.getDataTime());
    }


    //Apply to join a group
    @OnEvent(value = "addGroup")
    public void onEventJoin(SocketIOClient client, AckRequest ackRequest, AddMessage msg) {

        String id = msg.getToUid();
        //Everyone below the query group. If there is a current group that contains itself, it means repeating the group.
        List<GroupUser> groupUsers = groupSerivice.findUsersByGroupId(msg.getGroupId());
        for (GroupUser user : groupUsers) {
            if (user.getUser_id().equals(msg.getFromUid())) {
                ackRequest.sendAckData("Do not repeat grouping");
                logger.info("Repeatedly added. . . . . . brothers");
                return;
            }
        }

        ackRequest.sendAckData("");
        addMessageSerivice.saveAddMessage(msg);

        if (!StringUtils.isEmpty(id) && SessionUtil.userId_socket_Map.containsKey(id)) {
            SocketIOClient socketIOClient = SessionUtil.userId_socket_Map.get(id);
            socketIOClient.sendEvent("addGroup");
        }
        logger.info(msg.toString());
    }

    //Refuse to join the group
    @OnEvent(value = "refuseAddGroup")
    public void refuseAddGroup(SocketIOClient client, AckRequest ackRequest, JSONObject object) {

        ackRequest.sendAckData("");

        String id = object.getString("toUid");
        addMessageSerivice.updateAddMessage(object.getString("messageBoxId"));
//
        if (!StringUtils.isEmpty(id) && SessionUtil.userId_socket_Map.containsKey(id)) {
            SocketIOClient socketIOClient = SessionUtil.userId_socket_Map.get(id);
            socketIOClient.sendEvent("refuseAddGroup");
        }
        logger.info(object.toString());
    }

    //Agree to join the group
    @OnEvent(value = "agreeAddGroup")
    public void agreeAddGroup(SocketIOClient client, AckRequest ackRequest, JSONObject object) {


        String id = object.getString("toUid");
        String groupId = object.getString("groupId");
        UserEntity entity = (UserEntity) userSerivice.getEntityById(id);

        ackRequest.sendAckData("");

        addMessageSerivice.updateAddMessage(entity, groupId, object.getString("messageBoxId"));
//
        if (!StringUtils.isEmpty(id) && SessionUtil.userId_socket_Map.containsKey(id)) {
            SocketIOClient socketIOClient = SessionUtil.userId_socket_Map.get(id);
            socketIOClient.sendEvent("agreeAddGroup");
        }
        logger.info(object.toString());
    }


    //Leave group (return group)
    @OnEvent(value = "leave")
    public void onEventLeave(SocketIOClient client, AckRequest ackRequest, MessageEntity msg) {

    }

    //The message receiving portal, after receiving the message, looks up the sending target client, sends a message to the client, and sends a message to itself.
    @OnEvent(value = "chat")
    public void onEvent(SocketIOClient client, AckRequest ackRequest, MessageEntity msg) {

        boolean isChat = msg.getChat_type().toString().equals("chat");

        //Ask return data the server received the data sent
        if (ackRequest.isAckRequested()) {

            if (msg.getFrom_user().equals(msg.getTo_user())) {
                ackRequest.sendAckData("Please don't send a message to yourself");
                return;
            }

            //Save data to the server
            chatSerivice.saveMessageData(msg);

            String toName = "";
            if (isChat) {
                toName = msg.getTo_user();
            } else {
                toName = "group： " + msg.getTo_user();
            }
            logger.info("give " + toName + " The data sent by the server has been received, date: " + sdf.format(new Date()));
            //Send ask callback data to the client
            ackRequest.sendAckData("");
        }


        String to_user_id = msg.getTo_user_id(); //If it is a group chat, the id of the corresponding group
        String to_user_name = msg.getTo_user();

        if (isChat) { //Single chat
            // If the other party is online, find the corresponding client and send a message to them.
            if (SessionUtil.userId_socket_Map.containsKey(to_user_id)) {
                SessionUtil.userId_socket_Map.get(to_user_id).sendEvent("chat", new AckCallback<String>(String.class) {
                    //The other client receives the message and returns it to the server.
                    @Override
                    public void onSuccess(String result) {
                        logger.info(to_user_name + "Received message, ask reply： " + result + "    date： " + sdf.format(new Date()));
                    }

                    //Send message timeout
                    @Override
                    public void onTimeout() {
                        System.out.println(to_user_name + "---------》Send message timeout " + sdf.format(new Date()));
                    }
                }, msg);
            } else { //If offline, apns message push
                logger.info(to_user_name + "---------》Need to turn apns message push" + sdf.format(new Date()));
            }
        } else {  //group chat

            logger.info("========================Send group message==================================");

//            server.getBroadcastOperations().sendEvent("groupChat",msg); //System broadcast
            // Room (intra-group) broadcast
            server.getRoomOperations(to_user_id).sendEvent("chat", msg, new BroadcastAckCallback<String>(String.class) {
                @Override
                protected void onClientTimeout(SocketIOClient client) {
                    logger.info("Group message: " + client.get("userName") + " Send timed out");
                }

                @Override
                protected void onClientSuccess(SocketIOClient client, String result) {
                    logger.info("Group message: " + client.get("userName") + " Received" + DateUtils.getDataTimeYMDHMSS());
                }
            });
        }

    }


    public void sendMessageToAllClient(String userName) {
        Collection<SocketIOClient> clients = server.getAllClients();
        for (SocketIOClient client : clients) {

        }
    }
//
}
