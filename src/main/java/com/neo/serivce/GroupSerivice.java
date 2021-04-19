package com.neo.serivce;

import com.neo.entity.BaseEntity;
import com.neo.entity.GroupEntity;
import com.neo.entity.GroupUser;
import com.neo.entity.UserEntity;

import java.util.List;



public interface GroupSerivice<T extends BaseEntity> extends BaseSerivice<GroupEntity> {


    /**
     * Create group
     *
     * @param name
     * @return
     */
    GroupEntity creatGroup(String name, String avatar, UserEntity userEntity);


    /**
     * Query the corresponding group by name
     *
     * @return
     */
    List<GroupEntity> findGroupsByGroupName(String groupName);


    /**
     * Get all the groups I have
     *
     * @return
     */
    List<GroupEntity> findMyGroupsByUserId(String id);


    /**
     * Join group
     * @param entity
     * @param groupId
     * @return
     */
    GroupUser joinGroup(UserEntity entity, String groupId);


    /**
     * Get all members below the group
     *
     * @return
     */
    List<GroupUser> findUsersByGroupId(String group_id);


}
