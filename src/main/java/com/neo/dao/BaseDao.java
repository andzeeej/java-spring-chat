package com.neo.dao;

import com.neo.entity.BaseEntity;

import java.util.List;


public interface BaseDao<T extends BaseEntity> {


    /**
     * Query entities based on Id
     */
    public T findEntityById(String id);

    /**
     * New entity
     */
    public void  saveEntity(T entity);

    /**
     * Update entity
     */
    public T updateEntityById(String id,T entity);

    /**
     * Delete entity based on Id
     */
    public int deleteEntityById(String id);

    /**
     * Query all
     */
    public List<T> selectAll();


}
