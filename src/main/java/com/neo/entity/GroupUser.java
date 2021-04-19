package com.neo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



//Group member
@Document(collection = "t_group_user")
public class GroupUser extends BaseEntity {

    @Id
    private String id;
    private String group_id;    // Group id
    private String user_id;     //Group member id
    private String username;    //Group member's name

    // Redundant data, do not want to associate queries
    private String avatar;      //Group member's avatar
    private String sign;        //signature
    private String joninTime;   //Join time

    public String getJoninTime() {
        return joninTime;
    }

    public void setJoninTime(String joninTime) {
        this.joninTime = joninTime;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getSign() {
        return sign;
    }

    public void setSign(String sign) {
        this.sign = sign;
    }


    public String getGroup_id() {
        return group_id;
    }

    public void setGroup_id(String group_id) {
        this.group_id = group_id;
    }
}
