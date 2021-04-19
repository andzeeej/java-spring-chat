package com.neo.dao;

import com.neo.entity.BaseEntity;
import com.neo.entity.GroupEntity;
import com.neo.entity.GroupUser;

import java.util.List;


public interface GroupDao<T extends BaseEntity> extends BaseDao<GroupEntity> {

    /**
     * Query all groups based on the group name
     *
     * @return
     */
    List<GroupEntity> findGroupsByGroupName(String groupName);


    /**
     * Get all the groups I have
     *
     * @return
     */
    List<GroupEntity> findMyGroupsByUserId(String userId);



    /**
     * Get all the people below
     * @return
     */
    List<GroupUser> findUsersByGroupId(String group_id);



}
