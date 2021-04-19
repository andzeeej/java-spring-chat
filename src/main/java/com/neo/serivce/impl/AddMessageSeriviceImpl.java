package com.neo.serivce.impl;

import com.alibaba.fastjson.JSONObject;
import com.neo.dao.AddMessageDao;
import com.neo.dao.GroupDao;
import com.neo.dao.UserDao;
import com.neo.entity.*;
import com.neo.enums.AddMessageType;
import com.neo.exception.RepeatException;
import com.neo.serivce.AddMessageSerivice;
import com.neo.serivce.GroupSerivice;
import com.neo.utils.DateUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;


@Component
public class AddMessageSeriviceImpl<T extends BaseEntity> extends BaseSeriviceImpl<UserEntity> implements AddMessageSerivice<UserEntity> {

    @Resource
    UserDao userDao;

    @Resource
    AddMessageDao addMessageDao;

    @Resource
    GroupDao groupDao;

    @Resource
    GroupSerivice groupSerivice;

    /**
     * Add friend, group information request
     *
     * @param msg
     */
    @Override
    public void saveAddMessage(AddMessage msg) {
        msg.setTime(DateUtils.getDataTimeYMDHMS());
        userDao.saveEntity(msg);
    }

    /**
     * @description Query message box information
     */
    @Override
    public JSONObject findAddInfo(String userId) {

        JSONObject obj = new JSONObject();

        List<AddMessage> list = addMessageDao.findAddInfo(userId);

        List<AddInfo> infos = new ArrayList<>();
        for (AddMessage message : list) {
            AddInfo info = new AddInfo();
            if (message.getType().equals("group")) {
                GroupEntity entity = (GroupEntity) groupDao.findEntityById(message.getGroupId());
                info.setContent("Applications for Membership '" + entity.getGroupname() + "' group chat!");
            } else {
                info.setContent("Apply to add you as a friend");
            }

            info.setId(message.getId());
            info.setType(message.getType());
            info.setFrom(message.getFromUid());
            info.setUid(message.getToUid());
            info.setRead(message.getMsgResult().toString());
            UserEntity userEntity = getEntityById(message.getFromUid());
            userEntity.setPassword("");
            userEntity.setAuth_token("");
            info.setUser(userEntity);
            info.setFrom_group(message.getGroupId());
            info.setTime(message.getTime());
            info.setRemark(message.getRemark());
            infos.add(info);
        }

        obj.put("list", infos);
        obj.put("pages", 1);
        return obj;
    }


    /**
     * Update add message data
     *
     * @param entity
     * @param messageId
     * @return
     */
    @Override
    @Transactional
    public void updateAddMessage(UserEntity entity, String groupId, String messageId) {

        String userId = entity.getId(); //Apply for group
        //Everyone below the query group. If there is a current group that contains itself, it means repeating the group.
        List<GroupUser> groupUsers = groupSerivice.findUsersByGroupId(groupId);
        for (GroupUser user : groupUsers) {
            if (user.getUser_id().equals(userId)) {
                throw new RepeatException(-1, "Cannot repeat group");
            }
        }

        AddMessage addMessage = (AddMessage) addMessageDao.findEntityById(messageId);
        addMessage.setMsgResult(AddMessageType.Agree);
        addMessageDao.updateEntityById(messageId, addMessage);

        groupSerivice.joinGroup(entity, groupId);
    }

    /**
     * Refuse to add a group, or, friend
     *
     * @param messageBoxId
     */
    @Override
    public void updateAddMessage(String messageBoxId) {
        AddMessage addMessage = (AddMessage) addMessageDao.findEntityById(messageBoxId);
        addMessage.setMsgResult(AddMessageType.Reject);
        addMessageDao.saveEntity(addMessage);  //update data
    }


}
