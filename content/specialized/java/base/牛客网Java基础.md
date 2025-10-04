+++
date = "2023-12-07T16:52:54"
title = "java基础"
tags= ["JAVA"]
categories = ["专业"]
+++
# 						java基础

## JDBC

### 1、执行对象Statement、PreparedStatement、CallableStatement

* 三者都是接口
* Statement继承自Wrapper、PreparedStatement继承自Statement、CallableStatement继承自PreparedStatement。
* statement接口提供了执行语句和获取结果的基本方法；
  * PreparedStatement接口添加了处理IN参数的方法；
    * CallableStatement接口添加了处理OUT参数的方法；
* Statement普通的不带参的查询SQL；支持批量更新，批量删除；
  * 可变参数的SQL，编译一次执行多次，效率高；安全性好，防止SQL注入	，支持批量更新和删除，
    * CallableStatement继承自PreparedStatemet，支持带参数的SQL操作；支持调用存储过程，支持对输出/输入/输入输出参数的支持；
* Statement每次执行sql语句，数据库都要执行sql语句的编译，最好用于仅执行一次查询返回结果的情形，效率高于PreparedStatement；
* PreparedStatement执行的SQL是预编译的，使用PreparedStatement的好处；
  * 在执行一条可变参数的SQL时，PreparedStatement比Statement的效率高些，因为预编译一条SQL会比多次编译一条SQL的效率要高些。
  * 安全性高，防止SQL注入
  * 代码的可读性和可维护性高



**总结：**

​	其中 Statement 用于通用查询， PreparedStatement 用于执行参数化查询，而 CallableStatement则是用于存储过程

## 多线程

### 1、sleep（）和wait（）

**共同点** **：** 
1. 他们都是在多线程的环境下，都可以在程序的调用处阻塞指定的毫秒数，并返回。 
2. wait()和sleep()都可以通过interrupt()方法 打断线程的暂停状态 ，从而使线程立刻抛出InterruptedException。 
如果线程A希望立即结束线程B，则可以对线程B对应的Thread实例调用interrupt方法。如果此刻线程B正在wait/sleep/join，则线程B会立刻抛出InterruptedException，在catch() {} 中直接return即可安全地结束线程。 
需要注意的是，InterruptedException是线程自己从内部抛出的，并不是interrupt()方法抛出的。对某一线程调用 interrupt()时，如果该线程正在执行普通的代码，那么该线程根本就不会抛出InterruptedException。但是，一旦该线程进入到 wait()/sleep()/join()后，就会立刻抛出InterruptedException 。 
**不同点** **：** 
1.每个对象都有一个锁来控制同步访问。Synchronized关键字可以和对象的锁交互，来实现线程的同步。 
sleep方法没有释放锁，而wait方法释放了锁，使得其他线程可以使用同步控制块或者方法。 
2.wait，notify和notifyAll只能在同步控制方法或者同步控制块里面使用，而sleep可以在任何地方使用 
3.sleep必须捕获异常，而wait，notify和notifyAll不需要捕获异常 

4.sleep是线程类（Thread）的方法，导致此线程暂停执行指定时间，给执行机会给其他线程，但是监控状态依然保持，到时后会自动恢复。调用sleep不会释放对象锁。

5.wait是Object类的方法，对此对象调用wait方法导致本线程放弃对象锁，进入等待此对象的等待锁定池，只有针对此对象发出notify方法（或notifyAll）后本线程才进入对象锁定池准备获得对象锁进入运行状态。