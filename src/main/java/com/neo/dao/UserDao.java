package com.neo.dao;

import com.neo.entity.*;

import java.util.List;


public interface UserDao<T extends BaseEntity> extends BaseDao<UserEntity> {

    //Query user by name
    UserEntity findUserByUserName(String name);

    //Query user accorded to Token
    UserEntity findUserByToken(String access_token);


    /**
     * Query the corresponding person according to the user name
     *
     * @return
     */
    List<UserEntity> findUsersByName(String page, String name);
}
