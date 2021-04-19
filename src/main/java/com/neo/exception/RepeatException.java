package com.neo.exception;


//Duplicate data anomaly
public class RepeatException extends RuntimeException{

    //Custom error code
    private Integer code;
    //Custom constructor, keep only one, so you must enter the error code and content
    public RepeatException(int code, String msg) {
        super(msg);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

}
