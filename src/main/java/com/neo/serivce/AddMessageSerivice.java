package com.neo.serivce;

import com.alibaba.fastjson.JSONObject;
import com.neo.entity.AddMessage;
import com.neo.entity.BaseEntity;
import com.neo.entity.UserEntity;


public interface AddMessageSerivice<T extends BaseEntity> extends BaseSerivice<UserEntity> {

    /**
     * Add friend, group information request
     * @param msg
     */
    void saveAddMessage(AddMessage msg);

    /**
     * @description Query message box information
     */
    JSONObject findAddInfo(String userId);


    /**
     * Refuse to add a group, or, friend
     * @param messageBoxId
     */
    void updateAddMessage(String messageBoxId);


    /**
     * Update add message data
     * @param entity
     * @param messageId
     * @return
     */
    void updateAddMessage(UserEntity entity,String groupId,String messageId);

}
