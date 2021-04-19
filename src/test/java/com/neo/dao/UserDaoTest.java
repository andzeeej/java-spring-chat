package com.neo.dao;

import com.google.protobuf.InvalidProtocolBufferException;
import com.neo.entity.GpsData;
import com.neo.entity.GroupEntity;
import com.neo.entity.UserEntity;
import com.neo.serivce.GroupSerivice;
import com.neo.serivce.UserSerivice;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.servlet.http.HttpSession;

/**
 * Created by summer on 2017/5/5.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
public class UserDaoTest {

    @Autowired
    private UserSerivice serivice;

    @Autowired
    private GroupSerivice groupSerivice;

    @Autowired
    protected HttpSession session;

    @Test
    public void testSaveUser() throws Exception {


        UserEntity user = serivice.register("borolis", "111", "https://s8.hostingkartinok.com/uploads/images/2019/05/8e8a7156b254663d04739f4e5131926a.jpg");
        System.out.println("ID：" + user.getId());
        user = serivice.register("george", "111", "https://s8.hostingkartinok.com/uploads/images/2019/05/64cc8edfd5b1456e5c01b503371ffdff.jpg");
        System.out.println("ID：" + user.getId());

        creatGroup();

    }

    public void creatGroup() throws Exception {
//        UserEntity user = new UserEntity();
//        user.setAuth_token(UUID.randomUUID().toString());
//        user.setUsername("90905555");
//        user.setPassword("456");
//        serivice.saveEntity(user);

        UserEntity user = serivice.findUserByUserName("borolis");
        session.setAttribute("username", user);

        GroupEntity entity = groupSerivice.creatGroup("it-proggers", "https://s8.hostingkartinok.com/uploads/images/2019/05/46af4258663e05eaa8f8a14a2afa575c.jpg", user);
        System.out.println("ID：" + entity.getId());

    }


    @Test
    public  void testProutobu() throws InvalidProtocolBufferException {
        //Simulation converts objects into byte[] for easy transfer
        GpsData.gps_data.Builder builder = GpsData.gps_data.newBuilder();
        builder.setId(1);
        builder.setDataTime("2018-07-03");
        GpsData.gps_data bd = builder.build();
        System.out.println("before :"+ bd.toString());

        System.out.println("===========Person Byte==========");
        for(byte b : bd.toByteArray()){
            System.out.print(b);
        }
        System.out.println();
        System.out.println(bd.toByteString());
        System.out.println("================================");

        //Analog receive Byte[], deserialized into Person class
        byte[] byteArray =bd.toByteArray();
        GpsData.gps_data gps_data = GpsData.gps_data.parseFrom(byteArray);
        System.out.println("after :" +gps_data.toString());
    }


}
