package com.neo.serivce.impl;

import com.neo.dao.GroupDao;
import com.neo.entity.BaseEntity;
import com.neo.entity.GroupEntity;
import com.neo.entity.GroupUser;
import com.neo.entity.UserEntity;
import com.neo.exception.RepeatException;
import com.neo.serivce.GroupSerivice;
import com.neo.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Component
public class GroupSeriviceImpl<T extends BaseEntity> extends BaseSeriviceImpl<GroupEntity> implements GroupSerivice<GroupEntity> {

    @Autowired
    GroupDao groupDao;


    @Transactional
    @Override
    public GroupEntity creatGroup(String name, String avatar, UserEntity user) {

        //Do not allow duplicate group names to be created
        if (groupDao.findGroupsByGroupName(name).size() > 0) {
            throw new RepeatException(-1, "Group name cannot be repeated");
        }

        //Create group
        GroupEntity entity = new GroupEntity();
        entity.setCreat_date(DateUtils.getDataTimeYMD());
        entity.setGroupname(name);
        entity.setUser_id(user.getId());
        entity.setUser_name(user.getUsername());
        entity.setAvatar(avatar);
        groupDao.saveEntity(entity);

        //Add yourself to the group
        joinGroup(user, entity.getId());

        return entity;
    }

    //Join group
    @Override
    public GroupUser joinGroup(UserEntity user, String groupId) {

        GroupUser groupUser = new GroupUser();
        groupUser.setGroup_id(groupId);
        groupUser.setUser_id(user.getId());
        groupUser.setUsername(user.getUsername());
        groupUser.setAvatar(user.getAvatar());
        groupUser.setSign(user.getSign());
        groupUser.setJoninTime(DateUtils.getDataTimeYMDHMS());

        groupDao.saveEntity(groupUser);
        return groupUser;
    }



    /**
     * Get all members under the group based on the group id
     *
     * @return
     */
    @Override
    public List<GroupUser> findUsersByGroupId(String group_id) {
        return groupDao.findUsersByGroupId(group_id);
    }


    /**
     * Query the corresponding group by name
     *
     * @return
     */
    @Override
    public List<GroupEntity> findGroupsByGroupName(String groupName) {
        return groupDao.findGroupsByGroupName(groupName);
    }

    /**
     * Get all the groups I have
     *
     * @return
     */
    @Override
    public List<GroupEntity> findMyGroupsByUserId(String id) {
        return groupDao.findMyGroupsByUserId(id);
    }



}
