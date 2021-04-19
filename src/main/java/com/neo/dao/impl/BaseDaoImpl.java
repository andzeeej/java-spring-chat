package com.neo.dao.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mongodb.WriteResult;
import com.neo.dao.BaseDao;
import com.neo.entity.BaseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.lang.reflect.ParameterizedType;
import java.util.List;
import java.util.Map;


public class BaseDaoImpl<T extends BaseEntity> implements BaseDao<T> {

    @Autowired
    protected MongoTemplate mongoTemplate;

    protected Class<T> entityClass;

    public BaseDaoImpl() {
        // Use reflection technology to get the true type of T
        ParameterizedType pt = (ParameterizedType) this.getClass().getGenericSuperclass(); // Get the generic parent class of the current new object
        this.entityClass = (Class<T>) pt.getActualTypeArguments()[0]; // Get the true type of the first type parameter-
    }


    @Override
    public T findEntityById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        T t = mongoTemplate.findOne(query, entityClass);
        return t;
    }

    @Override
    public void saveEntity(T entity) {
        mongoTemplate.save(entity);
    }

    @Override
    public T updateEntityById(String id, T entity) {

        Query query = new Query(Criteria.where("id").is(id));

        Update update = new Update();

        JSONObject jsonObject = (JSONObject) JSON.toJSON(entity);

        for (Map.Entry<String, Object> entry : jsonObject.entrySet()) {
            if (!entry.getKey().equals("id")) {
                update.set(entry.getKey(), entry.getValue() == null ? "" : entry.getValue());
            }
        }
        //Update query returns the first item of the result set
        WriteResult result = mongoTemplate.updateFirst(query, update, entityClass);
        //Update the query to return all of the result set
//        return mongoTemplate.updateMulti(query,update,entityClass);
//        if (result != null)
//            return result.getN();
//        else
//            return t;
        return entity;
    }


    // Delete object
    @Override
    public int deleteEntityById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        WriteResult writeResult = mongoTemplate.remove(query, entityClass);
        return writeResult != null ? writeResult.getN() : 0;
    }

    @Override
    public List<T> selectAll() {
        return mongoTemplate.findAll(entityClass);
    }
}
