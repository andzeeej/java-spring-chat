package com.neo.enums;


public enum EResultType {

    /**
     * Successful return of access
     */
    SUCCESS(1, "success"),

    /**
     * Username or password is incorrect
     */
    PASSWORK_ERROR(-1, "Username or password is incorrect"),

    /**
     * Data does not exist to return
     */
    NOT_FOUND(-1, "notFound [Data does not exist or data is empty]"),

    /**
     * Exception return
     */
    ERROR(-1, "error [Unknown exception]"),

    /**
     * The parameter has an exception return
     */
    GLOABLE_ERROR(-1, "Global exception"),

    /**
     * The parameter has an exception return
     */
    PARAMETER_ERROR(-1, "parameter error [Parameter exception: the parameter is empty or the parameter type does not match.]");

    private Integer code;

    private String msg;

    private EResultType(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public Integer getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

}
