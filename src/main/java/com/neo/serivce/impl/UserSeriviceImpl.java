package com.neo.serivce.impl;

import com.neo.dao.AddMessageDao;
import com.neo.dao.GroupDao;
import com.neo.dao.UserDao;
import com.neo.entity.BaseEntity;
import com.neo.entity.UserEntity;
import com.neo.exception.RepeatException;
import com.neo.serivce.UserSerivice;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;


@Component
public class UserSeriviceImpl<T extends BaseEntity> extends BaseSeriviceImpl<UserEntity> implements UserSerivice<UserEntity> {

    @Resource
    UserDao userDao;

    @Resource
    GroupDao groupDao;


    @Resource
    AddMessageDao addMessageDao;

//        Query.query(Criteria.where("classObj.$id")
//                .is(new ObjectId("57fa4b99d4c68bb7d044d616"))), Student.class)


    @Override
    public UserEntity findUserByUserName(String name) {
        return userDao.findUserByUserName(name);
    }

    @Override
    public UserEntity findUserByToken(String access_token) {
        return userDao.findUserByToken(access_token);
    }

    /**
     * register
     *
     * @param name
     * @param password
     * @return
     */
    @Override
    public UserEntity register(String name, String password, String avatar) {

        //Username must be unique
        if (userDao.findUserByUserName(name) != null) {
            throw new RepeatException(-1, "Username cannot be repeated");
        }

        //Get the current date
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date today = new Date();
        //Get the date after thirty days
        Calendar theCa = Calendar.getInstance();
        theCa.setTime(today);
        theCa.add(theCa.DATE, 30);
        Date start = theCa.getTime();
        String startDate = sdf.format(start);//Date after thirty days

        UserEntity user = new UserEntity();
        user.setAuth_token(UUID.randomUUID().toString());
        user.setAuth_date(startDate);
        user.setUsername(name);
        user.setPassword(password);
        user.setAvatar(avatar);
        user.setSign("Have you all the way");
        userDao.saveEntity(user);
        return user;
    }

    /**
     * Query the corresponding person by user name
     *
     * @return
     */
    @Override
    public List<UserEntity> findUsersByName(String page, String name) {
        return userDao.findUsersByName(page,name);
    }


}
