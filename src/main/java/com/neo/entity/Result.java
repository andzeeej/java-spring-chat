package com.neo.entity;

import com.neo.enums.EResultType;


public class Result<T> {
    /*Return code*/
    private Integer code;
    /*Return message prompt*/
    private String msg;
    /*Returned data*/
    private T data;

    public Result() {
    }

    public Result(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public Result(Integer code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public Result(EResultType type,T data) {
        this.code = type.getCode();
        this.msg = type.getMsg();
        this.data = data;
    }

    public Result(EResultType type) {
        this.code = type.getCode();
        this.msg = type.getMsg();
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
