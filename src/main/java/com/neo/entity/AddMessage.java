package com.neo.entity;

import com.neo.enums.AddMessageType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "t_add_message")
public class AddMessage extends BaseEntity {

    @Id
    private String id;

    private String fromUid;     //Who initiated the request

    private String toUid;       //The application sent to who may be the group, then the user who created the group
    private String groupId;     //Founder

    private String remark;      //postscript

    private String ext;     //Extended data

    private AddMessageType msgResult = AddMessageType.Untreated;      //Message processing result

    private String  type;       //Type , may be adding a friend or group friend friend, group group

    private String  time;       //application time


    public String getExt() {
        return ext;
    }

    public void setExt(String ext) {
        this.ext = ext;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFromUid() {
        return fromUid;
    }

    public void setFromUid(String fromUid) {
        this.fromUid = fromUid;
    }

    public String getToUid() {
        return toUid;
    }

    public void setToUid(String toUid) {
        this.toUid = toUid;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }


    public AddMessageType getMsgResult() {
        return msgResult;
    }

    public void setMsgResult(AddMessageType msgResult) {
        this.msgResult = msgResult;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }


    @Override
    public String toString() {
        return "AddMessage{" +
                "id='" + id + '\'' +
                ", fromUid='" + fromUid + '\'' +
                ", toUid='" + toUid + '\'' +
                ", groupId='" + groupId + '\'' +
                ", remark='" + remark + '\'' +
                ", ext=" + ext +
                ", msgResult=" + msgResult +
                ", type='" + type + '\'' +
                ", time=" + time +
                '}';
    }
}
