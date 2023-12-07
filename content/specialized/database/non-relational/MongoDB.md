+++
date = "2023-12-07T16:52:54"
title = "MongoDB"

+++
# MongoDB

## 一、CAP定理

​		在计算机科学中，CAP定理，又被称作 布鲁尔定理，它指出对于一个分布式计算机系统来说，不可能同时满足以下三点：

* 一致性（C）：所有节点在同一时间具有相同的数据
* 可用性（A）：保证每个请求不管成功或者失败都有响应
* 分隔容忍（P）：系统中任意信息的丢失或者失败不会影响系统的继续运行



​		CPA理论的核心是：一个分布式系统不可能同时很好的满足一致性，可用性和分区容错性这三个需求，最多只能同时满足两个。因此，根据CAP原理将NoSQL数据库分成满足CA原则、满足CP原则和满足AP原则三大类：

* CA-单点集群，满足一致性，可用性，通常在扩展性上不太强。（RDBMS）
* CP-满足一致性，分区容忍性的系统，通常性能不是很高。（MongoDB、HBase、Redis）
* AP-满足可用性，分区容忍性的系统，通常可能对一致性的要求低。（CouchDB、Cassandra、DynamoDB）



## 二、BASE

* BA（Basically Available）--基本可用
* S（Soft state） --软状态/柔性事物。无连接的，“Hard state”是“面向连接”的
* E（Eventually Consistency）--最终的一致性，也是ACID的最终目的。 



## 三、NoSQL数据库分类

<img src="/Users/chengborong/Desktop/笔记文件/笔记图片/image-20210413143352910.png" alt="image-20210413143352910"  />

## 四、MongoDB

### 1、什么是MongoDB？

​		MongoDB是由C++语言编写的，是一个基于**分布式文件存储**的开源数据库系统；

​		在高负载的情况下，添加更多的节点，可以保证服务器的性能；

### 2、MongoDB是用来干什么的？

​		MongoDB旨在为WEB应用提供可扩展的高性能数据存储解决方案。

​		MongoDB将数据存储成一个文档，数据结构由（key=》value）对组成。

### 3、MongoDB的主要特点

* MongoDB是一个面向文档存储的数据库，操作起来比较简单和容易。

* 可以在MongoDB记录中设置索引来实现更快的排序。

* Mongo支持丰富的查询表达式，查询指令使用JSON形式的标记，可轻易查询文档中的内嵌的对象及数组。

* MongoDB中的Map/reduce主要是对数据进行批量处理和聚合操作。

* Map和Reduce，Map函数调用emit（key，value）遍历集合中所有的记录，将key与value传给Reduce函数进行处理。

* GridFS是MongoDB中的一个内置功能，可用于存放大量小文件。

* MongoDB允许在服务端执行脚本，可以用Javascript编写某个函数，直接在服务端执行，也可以把函数的定义存储在服务端，下次直接调用即可。

  

### 4、MongoDB概念解析

​		NoSQL非关系数据库和关系数据库的基本概念区别：

![image-20210413153423361](/Users/chengborong/Desktop/笔记文件/笔记图片/image-20210413153423361.png)

## 五、MongoDB组成

### 1、文档

​		文档是一组键值对，MongoDB的文档不需要设置相同的字段，并且相同的字段不需要相同的数据类型，这与关系数据库区别很大。

​		文档等价于关系数据库中的一条记录。

**注意：**

```java
1、文档中的键值对是有序的。
2、文档中的值不仅可以是在双引号里面的字符串，还可以是其他几种数据类型（甚至可以是整个文档嵌入）。
3、MongoDB区分类型和大小写。
4、MongoDB的文档不能有重复的键。 
5、文档的键是字符串。除了少数情况例外。  
```



### 2、集合

​		集合就是MongoDB的文档组，类似于RDBMS中的表格，集合存在于数据库中，集合没有固定的结构，这意味着你在对集合可以插入不同格式和类型的数据，通常情况下插入集合的数据都会有一定的关联性。

​		当第一个文档插入时，集合被创建。



### 3、capped collection

​		Capped collection就是**固定大小**的collection。它有很高的性能以及队列的特性（过期按照插入的顺序），有点和“RRD”概念类似。

​		Capped collection是高性能自动的维护对象的**插入顺序**。适合类似记录日志的功能和标准的collection不同，必须要显示的创建一个capped collection，指定一个collection的大小，单位是字节，collection的数据存储空间值是提前分配的。

**注意：**

```java
1、在capped collection中，你能添加新的对象。
2、能进行更行，然而，对象不会增加存储空间，如果增加，更新就失败。
3、使用Capped Collection不能删除一个文档，可以使用drop（）方法删除collection所有行。
4、删除后必须显示创建这个collection  
```



### 4、元数据

​		在MongoDB数据库中的名字空间<dbname>.system.* 是包含多种系统信息的特殊集合，如下：

![image-20210413162408455](/Users/chengborong/Desktop/笔记文件/笔记图片/image-20210413162408455.png)		

## 六、MongoDB操作命令

### 1、操作前步骤

```java
1、进入对应的文件夹 /etc
2、启动mongodb的服务--sudo service mongod start
3、进入mongodb数据库 mongo
4、查看进程-- ps -ef ｜ grep mongod
5、查看进程对应的端口号 -- netstat -lntp ｜ grep "27017"  
6、查看所有进程对应的端口号 -- netstant -lntps
```

### 2、对数据库进行操作

**数据库：**

```java
1、切换或创建数据库 --  use  database_name       使用指定名字的数据库（不存在则创建数据库）
2、查看所有数据库  --  show dbs
3、查看当前数据库  --  db
4、向数据库中插入数据 --  db.测试集合.insert({"name":"测试数据","time":"2021-04-13 16:53"})   往“测试集合”数据库的“测试集合”集合中插入数据，集合不存在则创建。
5、删除当前数据库  -- db.dropDatabase()  
```

​		MongoDB中默认数据库test，没有创建新的数据库，集合放在test数据库中。

**集合：**

```java
1、创建集合  --db.createCollection("集合名称","指定内存大小及索引选项")
options参数：
		capped：布尔类型，为true时，创建固定集合，固定大小的集合达到最大值时，它会自动覆盖最早的文档。而且必须指定size参数。
  	autoIndexId：布尔类型，3.2后不支持，自动在_id字段创建索引。默认为false
  	size：数值类型，为固定集合指定一个最大值，即字节数
  	max：数值类型，指定固定集合中包含文档的最大数量
  db.createCollection("测试集合",{capped:true,autoIndex:true.size:204800,max:1000})
  创建一个“测试集合”集合，固定大小204800b文档最大个数是1000，而且_id创建索引。
2、显示当前集合  --show collections   或者  show  tables
3、删除集合  --db.collection.drop()
```

**文档：**

```java
1、插入文档  --db.测试集合.insert({"name","测试数据2","time":2021-04-13 17:16}) 
  				 --db.测试集合.save({"name","测试数据2","time":2021-04-13 17:16})
  	区别：
  		save():如果_id如果主键存在则更新数据，如果不存在就插入数据。被废弃使用insertOne()或replaceOne()代替
  		insert():若插入的数据主键已存在，会抛出DuplicateKeyException异常，提示主键已存在。
  		3.2版本后增加了insertOne()和insertMany()
2、批量插入实例
  	db.collection.insertMany([{"age":11,"name":"张三"},{"age":15,"name":"李四"}],					   {writeConcern:0,ordered:true})
  往collection集合中插入了张三李四两条数据
  writeConcern：写入策略，默认为1，即要求确认写操作，0是不要求
  ordered：指定是否按顺序写入，默认true
3、修改文档
  	db.collection.update({query},{update},upsert,multi,writeConcern)
  query:查询参数
  update:更新的对象和一些更新的操作符
  upsert:可选，这个参数的意思是不存在update记录则插入，默认false不插入
  multi:默认false，只更新查找出来的第一条记录，ture更新所有记录
	writeConcern:抛出异常的级别 
实例：    
		只更新第一条记录：
			db.col.update( { "count" : { $gt : 1 } } , { $set : { "test2" : "OK"} } );
		全部更新：
			db.col.update( { "count" : { $gt : 3 } } , { $set : { "test2" : "OK"} },false,true );
		只添加第一条：
			db.col.update( { "count" : { $gt : 4 } } , { $set : { "test5" : "OK"} },true,false );
		全部添加进去:
			db.col.update( { "count" : { $gt : 5 } } , { $set : { "test5" : "OK"} },true,true );
		全部更新：
			db.col.update( { "count" : { $gt : 15 } } , { $inc : { "count" : 1} },false,true );
		只更新第一条记录：
			db.col.update( { "count" : { $gt : 10 } } , { $inc : { "count" : 1} },false,false );  
4、更新文档
  db.collection.save({document},{writeConcern})  _id主键存在则更新数据，不存在则插入
  		document：文档数据；
  		writeConcern：抛出的异常级别；
5、删除文档
  db.collection.remove({query},{justOne,writeConcern})
  		query:查询参数
      justOne: 默认为false，删除匹配的所有文档，设置为true或者1时只删除一个文档；
        
6、查询文档
   db.collection.find(query,projection).pretty()
      query:查询参数
      projection:使用投影操作符指定返回的键，查询所有的键值省略该参数。 
      pretty():返回的数据以易读的方式返回
      findOne():返回一个文档  
  
```

**注意：**

​		插入时指定“_id”字段，如果对应的值存在则会选择更新该条数据