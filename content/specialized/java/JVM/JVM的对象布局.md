+++
date = "2023-12-07T16:52:54"
title = "JVM的对象布局--定义"
tags = ["JAVA","JVM","并发编程"]
categories = ["专业"]
+++

# JVM的对象布局--定义

> JVM的设计需要遵循JAVA虚拟机规范，所以在不同的虚拟机上，对象的布局结构基本相同，大小不一定相同。

![20210131165506.png](https://borongcheng.github.io/static/picture/580757-20210131165507671-713263758.png)

# 一、类与对象

​		在编译时，通过javac编译器，将.java文件编译成虚拟机规范的class文件格式。class文件格式是与操作系统和机器指令集无关的、平台中立的格式。

​		其他语言编写的代码，只需要通过编译器将文件编译成.class格式，就可以用过JVM去运行。

​		这就是Java语言跨平台的根本原因。

![20210207102626.png](https://borongcheng.github.io/static/picture/580757-20210207102628551-303133282-20231210203307350.png)

​		通过java命令运行class文件，首先会通过类加载器将class文件加载到内存中，加载class文件会为类生成一个klass示例 。

​		在Klass包含了用于描述Java类的元数据，包括字段个数、大小、是否为数组、是否有父类、方法信息等。

# 二、对象

> 以目前使用的JDK8中的虚拟机，HotSpot中的对象布局来学习。
>
> HotSpot VM 使用oop描述对象，oop字面意思是“普通对象指针”。它是指向一片内存的的指针，只是将这片内存（强制类型转换）Java对象/数组。对象的本质就是用对象头和字段数据填充这部分内存。

* 结合JVM内存来解读
  * oop 指向内存，就相当于在栈中new一个对象，这个对象指向堆中对象的内存实例。

![img](https://borongcheng.github.io/static/picture/1162587-20200918154030998-188898614.png)

# 三、对象构成

> 根据Java虚拟机规范中的定义，堆中对象实例主要构成由三个部分组成；
>
> 对象头、实例数据、（数组大小）、对齐填充；

* 对象头
  * Java中的每个对象都会存在一个对象头，用来存储对象的元数据信息；
  * 如对象的Hash码锁状态等，不同的虚拟机定义的对象头大小不同。
* 实例数据
  * 主要存放对象的具体字段值，包括类中声明的实例变量和从父类中继承的实例变量。
  * 实例数据根据在类中声明的顺序及其类型来确定所在位置和占用内存字节。
* 数组大小
  * 如果对象类型是数组，需要单独记录数组的大小
* 对齐填充
  * 不是必然存在的组成，没有特殊含义，只起占位的作用
  * JVM规范中，给对象分配的内存必须是8个字节的倍数，如果不够，通过对齐填充来补齐。

![img](https://borongcheng.github.io/static/picture/1162587-20200917170455322-1670500196.png)



## 1、对象头

> 以HotSpot为例

```tex
object header
Common structure at the beginning of every GC-managed heap object. (Every oop points to an object header.) 
```

​		每个GC管理堆中对象开始的公共构造部位。（每个oop指针都会指向一个object header）

```tex
Includes fundamental information about the heap object's layout, type, GC state, synchronization state, and identity hash code. Consists of two words.
```

​		其中包含的基本信息有，堆中对象的布局、类型、GC状态、锁同步状态、对象的hashcode。由两部分组成（mark word + class pointer）。

```tex
 In arrays it is immediately followed by a length field. Note that both Java objects and VM-internal objects have a common object header format.
```

​		在数组对象中，它后面跟着数组的长度。	注意Java对象和VM中的对象都有一个公共的头格式。

![img](https://borongcheng.github.io/static/picture/399ccf65a9b7419aa77d2f111e2af583.png)

### 1.1、Mark Word

> ​		标记字，对象头的构成之一，主要存储类的元数据信息，和类的各种状态信息及HashCode。这部分在32位的虚拟机和64位的虚拟机分别为32个bite和64个bite。

```tex
mark word
The first word of every object header. Usually a set of bitfields including synchronization state and identity hash code. 
```

​		是每个对象头的第一个构成。通常是一组位字段，包括同步位和标识hash码等。

```tex
May also be a pointer (with characteristic low bit encoding) to synchronization related information. During GC, may contain GC state bits.
```

​		也可以是指向同步关系信息的指针(压缩指针)。对于GC，也包含GC的状态位。

#### 32位虚拟机

![img](https://borongcheng.github.io/static/picture/1162587-20200918154115022-312986152.png)

#### 64位虚拟机

![img](https://borongcheng.github.io/static/picture/1162587-20200918154125385-1537793659-20231213172902576.png)

* 虽然在不同位数的JVM中，长度不一致，但是基本组成是一致的。
  * 锁标志位(lock)：用于JVM判定对象是否被锁住，以及[锁的膨胀优化](/Users/chengborong/Desktop/笔记文件/锁膨胀.md)
    * 通过两个字节去判定对象处于哪种锁的状态。
  * 是否偏向锁(biased_lock)：用于区分锁标志位相同时，对象处于无锁状态还是偏向锁状态。
  * 分代年龄(age)：在Young区存活的次数，默认达到15次后进入old区（CMS垃圾收集器6次）
  * HashCode(identity_hashcode)：采用延迟加载的技术，调用System.identityHashCode(Object)获得,HotSpot采用的[xor-shit算法](/Users/chengborong/Desktop/笔记文件/HotSpot xor-shit算法.md)。当对象被锁定，该值会移动到管程Monitor中。
  * 线程ID(thread)：持有偏向锁的线程ID。
  * Epoch：偏向的时间戳。标识偏向锁在CAS锁操作过程中，对象更偏向哪个锁。
  * 轻量级锁指针(ptr_to_lock_record)：轻量级锁状态下，指向栈中锁记录的指针。
  * 重量级锁(ptr_to_heavyweight_montor)：重量级锁状态下，指向对象监视器Monitor的指针。
  * GC标记：由MarkSweep使用，标记一个对象为无效状态。

### 1.2、klass pointer

```tex
klass pointer
The second word of every object header. Points to another object (a metaobject) which describes the layout and behavior of the original object. For Java objects, the "klass" contains a C++ style "vtable".
```

​		是对象头组成的第二部分。它指向另一个对象（元对象），它描述了原始对象的布局和行为。对Java对象来说，Klass包含了一个C++风格的“vtable”

* 类型的指针(类型指针)
  * 是对象指向它类元数据的指针，虚拟机通过这个指针来确定对象是哪个类的实例。
  * 该指针长度是JVM的一个字大小，32位机器中是32位，64位里面为64位。
  * 64位机器可以通过配置 + UseCompressedOops来开启指针压缩，以下类型指针将会被压缩。
    * 每个类的静态变量指针。
    * 每个对象的属性指针。
    * 普通对象数据中每个元素指针。
  * 以下特殊类型的指针不会被压缩
    * 指向PermGen的Class对象指针。
    * JDK8中指向元空间对象的指针。
    * 本地变量。
    * 堆栈元素。
    * 入参、返回值。
    * NULL指针。

### 1.3、Array Length

​		如果是个数组对象，对象头还需要留有位置来单独存储数组的长度。长度由JVM机器的位数决定。



## 2、实例数据

​		存储对象的属性字段的信息，如果对象不存在属性字段则这部分数据为空。

​		根据属性字段的类型去占不同字节大小的内存空间。

​		默认按照long、doule、int、short、char、byte、boolean、reference顺序布局。

​		相同字段宽度的属性字段总是分配在一起。

​		若存在父对象，则父对象的实例总是在子对象之前。

​		如果HotSpot虚拟机的参数+XX:CompactFields 为true，子类变量中较窄的变量也能插入父类变量的间隙之间。



## 3、填充区

​		JVM中，对象大小默认为8的整数倍，若对象大小不能被8整除，则会填充空字节来填充对象保证。

