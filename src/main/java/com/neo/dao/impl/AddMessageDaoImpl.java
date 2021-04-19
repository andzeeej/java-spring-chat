package com.neo.dao.impl;

import com.neo.dao.AddMessageDao;
import com.neo.entity.AddMessage;
import com.neo.entity.BaseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class AddMessageDaoImpl<T extends BaseEntity> extends BaseDaoImpl<AddMessage> implements AddMessageDao<AddMessage> {

    /**
     * @description Query message box information
     */
    @Override
    public List<AddMessage> findAddInfo(String userId) {
        Query query = new Query(Criteria.where("toUid").is(userId));
        query.with(new Sort(new Sort.Order(Sort.Direction.DESC, "time")));
        List<AddMessage> list = mongoTemplate.find(query,entityClass);
        return list;
    }


}
