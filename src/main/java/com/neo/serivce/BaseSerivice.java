package com.neo.serivce;

import com.neo.entity.BaseEntity;

import java.util.List;



public interface BaseSerivice<T extends BaseEntity> {
    /**
     * Query entities based on Id
     */
    T getEntityById(String id);

    /**
     * New entity
     */
    void saveEntity(final T entity);
    /**
     * Update entity
     */
    T updateEntityById(String id, T entity);
    /**
     * Delete entity based on Id
     */
    int deleteEntityById(String id);

    /**
     * Query all
     */
    List<T> selectAll();

}
