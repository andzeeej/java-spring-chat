package com.neo.serivce;

import com.neo.entity.BaseEntity;
import com.neo.entity.UserEntity;

import java.util.List;



public interface UserSerivice<T extends BaseEntity> extends BaseSerivice<UserEntity> {


    /**
     * Check specific people by name
     *
     * @param name
     * @return
     */
    UserEntity findUserByUserName(String name);

    /**
     * Query entity by token
     *
     * @param access_token
     * @return
     */
    UserEntity findUserByToken(String access_token);

    /**
     * register
     *
     * @param name
     * @param password
     * @return
     */
    UserEntity register(String name, String password, String avatar);


    /**
     * Query the corresponding person according to the user name
     *
     * @return
     */
    List<UserEntity> findUsersByName(String page, String name);
}
