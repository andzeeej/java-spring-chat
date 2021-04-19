package com.neo.dao;

import com.neo.entity.AddMessage;
import com.neo.entity.BaseEntity;

import java.util.List;


public interface AddMessageDao<T extends BaseEntity> extends BaseDao<AddMessage> {

    /**
     * @description Query message box information
     */
    List<AddMessage> findAddInfo(String userId);

}
