package com.neo.serivce.impl;

import com.neo.dao.BaseDao;
import com.neo.entity.BaseEntity;
import com.neo.serivce.BaseSerivice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.lang.reflect.ParameterizedType;
import java.util.List;


public class BaseSeriviceImpl<T extends BaseEntity> implements BaseSerivice<T> {

    @Qualifier("userDaoImpl")
    @Autowired
    BaseDao<T> baseDao;

    protected Class<T> entityClass;

    public BaseSeriviceImpl() {
        // Use reflection technology to get the true type of T
        ParameterizedType pt = (ParameterizedType) this.getClass().getGenericSuperclass(); // Get the generic parent class of the current new object
        this.entityClass = (Class<T>) pt.getActualTypeArguments()[0]; // Get the true type of the first type parameter
    }

    @Override
    public T getEntityById(String id) {
        return baseDao.findEntityById(id);
    }

    @Override
    public void saveEntity(T entity) {
         baseDao.saveEntity(entity);
    }
    
    @Override
    public T updateEntityById(String id, T entity) {
        return baseDao.updateEntityById(id, entity);
    }

    @Override
    public int deleteEntityById(String id) {
        return baseDao.deleteEntityById(id);
    }

    @Override
    public List<T> selectAll() {
        return baseDao.selectAll();
    }
}
