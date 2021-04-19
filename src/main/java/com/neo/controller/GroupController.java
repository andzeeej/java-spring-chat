package com.neo.controller;

import com.alibaba.fastjson.JSONObject;
import com.neo.entity.GroupEntity;
import com.neo.entity.GroupUser;
import com.neo.entity.UserEntity;
import com.neo.serivce.GroupSerivice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping(value = "/group")
public class GroupController extends BaseController<UserEntity> {

    @Autowired
    GroupSerivice groupSerivice;


    /**
     * Query the corresponding group according to the name, and query the group if the group name is empty.
     *
     * @return
     */
    @ResponseBody
    @PostMapping(value = "/creat")
    public String creatGroup(String name, String avatar) {
        GroupEntity groupEntity = groupSerivice.creatGroup(name, avatar, getSessionUser());
        return retResultData(0, "", groupEntity);
    }


    /**
     * Query the corresponding group by name
     *
     * @return
     */
    @ResponseBody
    @GetMapping(value = "/findGroupsByName")
    public String findGroupsByName(String page, String name) {
        List<GroupEntity> list = groupSerivice.findGroupsByGroupName(name);
        return retResultData(0, "", list);
    }


    /**
     * Query the group members below the specified group
     *
     * @return
     */
    @ResponseBody
    @GetMapping(value = "/findGroupUsers")
    public String findGroupUsers(String id) {
        List<GroupUser> list = groupSerivice.findUsersByGroupId(id);
        for (GroupUser user : list) {
            user.setId(user.getUser_id());
            user.setUser_id("");
        }
        JSONObject obj = new JSONObject();
        obj.put("list", list);
        return retResultData(0, "", obj);
    }


}
