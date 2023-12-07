# Mycat

# 一、读写分离介绍

​		随着应用的访问量并发量的增加，应用的读写分离是很有必要的。

应用读写分离至少有两种方法：

* 应用本身通过代码实现，例如基于动态数据源，AOP的原理来实现写操作时用主数据库，读操作时用从数据库。
* 通过中间件的方式实现，例如通过Mycat，即中间件会分析对应的SQL，写操作时会连接主数据库，读操作时连接从数据库。

# 二、Mycat



## 1、介绍

​		Mycat  是一个强大的数据库中间件，不仅仅可以用作读写分离，以及分表分库，容灾备份，而且可以用于多租户应用开发、云平台基础设施，让你的架构具备很强的适应性和灵活性，借助于即将发布的Mycat 智能优化模块，系统的数据访问瓶颈和热点一目了然，根据这些统计分析数据，你可以自动或手工调整后端存储，将不同的表映射到不同存储引擎上，而整个应用的代码一行也不用改变。



## 2、原理

​		Mycat 的原理中最重要的一个动词是“拦截”，它拦截了用户发送过来的SQL语句，首先对SQL语句做了写特定的分析：如分片分析、路由分析、读写分析、缓存分析等等，然后将此SQL发往后端的真实数据库，并将返回的结果做适当的处理，最终再返回给用户。



## 3、下载安装

1、从mycat官网下载linux版本的mycat

http://www.mycat.org.cn/

2、上传到服务器并解压（默认/opt目录）

```java
tar -zxvf Mycat-server-1.6.7.6-test-20201104174609-linux.tar.gz mycat/
```

3、将文件拷贝到（usr/local目录）

```java
cp -r mycat/ /usr/local/
```

4、到mycat的bin目录下操作

```shell
./mycat start   #启动
./mycat status  #查看启动状态
./mycat restart #重启
```



## 4、配置文件

配置文件放置于mycat的conf目录下

1、schema.xml

​		定义逻辑库，表、分片节点等内容。

```xml
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">

 <schema name="TESTDB" checkSQLschema="true" sqlMaxLimit="100" randomDataNode="dn1" dataNode="dn1" >//指定节点
 </schema>
 <dataNode name="dn1" dataHost="host1" database="test" />  //读写分离的指定库名
 <dataHost name="host1" maxCon="1000" minCon="10" balance="0"
     writeType="0" dbType="mysql" dbDriver="jdbc" switchType="1"  slaveThreshold="100">
  <heartbeat>select user()</heartbeat>
  <!-- can have multi write hosts -->
  <writeHost host="hostM1" url="jdbc:mysql://172.15.2.55:3306" user="root"
       password="saimo888">//写表
  <readHost host="hostS1" url="jdbc:mysql://172.15.2.67:3306" user="root" password="saimo888" />
	//读表
  </writeHost>
 </dataHost>
</mycat:schema> 
```

读写分离负载均衡策略：

<img src="%E7%AC%94%E8%AE%B0%E5%9B%BE%E7%89%87/image-20211014184208754.png" alt="image-20211014184208754" style="zoom:50%;" />

2、rule.xml

		定义分片规则

3、server.xml

		定义用户以及系统相关变量，如端口等。

4、linux启动mycat

> 在 /mycat/bin/目录下
>
> 1、控制台启动  打印日志信息
>
> ./mycat console
>
> 2、普通启动
>
> ./mycat start

# 三、MySQL配置主从数据库

## 1、配置主数据库

1、修改配置文件 my.cnf

```java
[mysql]
## 同一局域网内注意要唯一
server-id = 100
## 开启二进制日志功能
log-bin = mysql-bin  
# 设置不需要复制的数据库 系统库
binlog-ignore-db=mysql
binlog-ingore-db=information_schema
# 设置需要复制的库 binlog-do-db = 复制库的名字 
```

2、创建数据slave用户

​		主要用户同步主从数据库数据，，授予用户slave REPLICATION SLAVE权限和REPLICATION CLIENT权限

```java
1、docker exec -it mysql-master bash
2、mysql -uroot -p123456
3、use mysql
4、CREATE USER 'slave'@'%' IDENTIFIED BY '123456'; 
5、GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'slave'@'%';
6、flush privileges;
```

​	

## 2、配置从数据库

1、修改配置文件my.cnf

```java
## 设置server_id，注意要唯一
server_id = 2
## 开启二进制日志功能,以备slave作为其他slave的master时使用
log-bin = mysql-slave-bin
## relay_log 配置中继日志
relay_log = edu-mysql-relay-bin
```



## 3、建立主从联系



1、进入master容器，并进入mysql

```java
1、docker exec -it mysql-master bash
2、mysql -uroot -p123456
3、show master status
记录File字段和Position字段的数据  
```

2、进入slave容器，并进入mysql

```java
1、docker exec -it mysql-master bash
2、mysql -uroot -p123456
3、stop slave //停止原有的salve  
4、change master to master_host='172.17.0.2', 
//master的地址，是指容器的独立服务器ip，                
//docker inspect 容器id   查询到networksetting 中的ipaddress
master_user='slave', //用户同步数据的用户
master_password='123456', //密码
master_port=3306, //master的端口号，指的是服务器的端口号
master_log_file='mysql-bin.000001', //指定Slave从哪个日志开始复制数据，即上文中提到的File字段
master_log_pos= 2830,//从哪个position开始读，上文中提到的position字段的值
master_connect_retry=30;//如果连接失败，重试的时间间隔，单位是秒，默认60
5、start slave  //启动salve
```

## 4、进入mycat操作

1、进入mycat

```java
1、docker exec -it mysql-master bash    //进入mysql环境
2、mysql -umycat -p1234567 -h (mycat所在服务端口号) -P 8066   
```
