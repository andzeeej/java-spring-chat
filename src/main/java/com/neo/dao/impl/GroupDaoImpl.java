package com.neo.dao.impl;

import com.neo.dao.GroupDao;
import com.neo.entity.BaseEntity;
import com.neo.entity.GroupEntity;
import com.neo.entity.GroupUser;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;


@Component
public class GroupDaoImpl<T extends BaseEntity> extends BaseDaoImpl<GroupEntity> implements GroupDao<GroupEntity> {


    /**
     * Query all groups accorded to the name of the group
     *
     * @return
     */
    @Override
    public List<GroupEntity> findGroupsByGroupName(String groupName) {
        List<GroupEntity> list;
        if (StringUtils.isEmpty(groupName)) {
            list = mongoTemplate.findAll(GroupEntity.class);
        } else {
            Query query = new Query(Criteria.where("groupname").regex(groupName));
            list = mongoTemplate.find(query, GroupEntity.class);
        }
        return list;
    }


    /**
     * Get all the groups I have
     *
     * @return
     */
    @Override
    public List<GroupEntity> findMyGroupsByUserId(String user_id) {
        // The group I created
        Query query = new Query(Criteria.where("user_id").is(user_id));
        List<GroupEntity> list = mongoTemplate.find(query, GroupEntity.class);

        //The group I added
        List<GroupUser> users = mongoTemplate.find(query, GroupUser.class);

        for (GroupUser user : users) {
            query = new Query(Criteria.where("id").is(user.getGroup_id()));
            GroupEntity entity = mongoTemplate.findOne(query, GroupEntity.class);
            if (!entity.getUser_id().equals(user_id)) { //Not a group created by yourself (just joined groups)
                list.add(entity);
            }
        }
        return list;
    }


    /**
     * Query all people below the group based on the group id
     *
     * @return
     */
    @Override
    public List<GroupUser> findUsersByGroupId(String group_id) {
        Query query = new Query(Criteria.where("group_id").is(group_id));
        List<GroupUser> list = mongoTemplate.find(query, GroupUser.class);
        return list;
    }
}
