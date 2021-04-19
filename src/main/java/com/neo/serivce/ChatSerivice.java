package com.neo.serivce;

import com.neo.entity.BaseEntity;
import com.neo.entity.MessageEntity;
import com.neo.entity.UserEntity;



public interface ChatSerivice<T extends BaseEntity> extends BaseSerivice<MessageEntity> {

    void saveMessageData(T entity);

    void sendApnData();
}
