+++
date = "2025-07-25T09:52:00"
title = "ForkJoinPool"
tags = ["JAVA","线程池","源码阅读"]
categories = ["专业"]
+++
# 一、定义
forkjoinpool是java 7 开始提供的用于并行执行的任务框架，广泛用于java 8 的parallelStream和CompletableFuture。

其主旨是将大任务拆分成若干个小任务，然后并行执行这些小任务，最后汇总这些任务执行的结果。这部分主要采用**分治法**实现。

此外ForkJoinPool还采用了**窃取算法**，避免工作线程由于拆分任务之后的join等待过程，处于空闲的线程从其他工作线程的任务队列里面窃取任务来执行。



# 二、实现
## 一、分治法
分治法的基本思想就是将一个规模为N的问题拆解成K个规模较小的同类型问题，这些子问题相互独立且与原问题类型一致。

求出子问题的解之后，将这些解合并，就可以得到原有问题的解。

例如：通过二分法在某个有序数组中查询一个数是否存在；

就可以将数组拆分成多个子集，然后并行的在这些子集里面查询。

![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758095307251-8a9c6e81-5b5c-4ffd-b7a9-fb6ed78490a6.png)



## 二、工作窃取
工作窃取的本质是让空闲线程去抢夺其他线程任务队列中未被处理的任务，提高CPU效率节省资源。

forkJoinPool任务处理流程：

+ 每个工作线程在自己的调度队列中维护可运行的任务。
+ 队列被维护成双端队列（Deque）。
+ 任务从队列尾端插入，当前线程消费任务按照LIFO（后入先出）从队列尾端获取任务。
+ 当前线程任调度队列任务为空时，会去其他线程的队列头获取任务FIFO（先入先出）。

> 线程正常消费和窃取任务分别在任务队列的两端，不会产生竞争。
>



## 三、使用
实现ForkJoin框架主要有两个类，一个是ForkJoinPool和ForkJoinTask。

通常都是直接继承ForkJoinTask的子类，重写里面的Compute方法。

+ RecursiveAction：无返回值的任务类。
+ RecursiveTask：有返回值的任务类。

实例：

并行累加数值

```java
package java.lang.bean;

import java.util.concurrent.RecursiveAction;

//无返回值的任务
public class RecursiveActionTest extends RecursiveAction {
    private int start;
    private int end;

    public RecursiveActionTest(int start, int end) {
        this.start = start;
        this.end = end;
    }

    @Override
    protected void compute() {
        int sum = 0;
        //如果计算值差小于10 直接计算
        if (end - start < 10) {
            for (int i = start; i < end; i++) {
                sum += i;
                System.out.println(Thread.currentThread().getName() + ": " + sum);
            }
        } else {
            //通过拆分任务计算
            int middle = (start + end) / 2;
            RecursiveActionTest test = new RecursiveActionTest(middle, end);
            RecursiveActionTest test1 = new RecursiveActionTest(start, middle);
            invokeAll(test,test1);
        }
    }
}

```

```java
package java.lang.bean;

import java.util.concurrent.RecursiveTask;

//有返回值的任务
public class RecursiveTaskTest extends RecursiveTask<Integer> {

    private int start;
    private int end;
    public RecursiveTaskTest(int start, int end) {
        this.start = start;
        this.end = end;
    }
    @Override
    protected Integer compute() {
        int sum = 0;
        if (end - start < 10) {
            for (int i = start; i < end; i++) {
                sum += i;
            }
            return sum;
        } else {
            //通过拆分任务计算
            int middle = (start + end) / 2;
            RecursiveTaskTest test = new RecursiveTaskTest(middle, end);
            RecursiveTaskTest test1 = new RecursiveTaskTest(start, middle);
            invokeAll(test,test1);
            return test.join() + test1.join();
        }
    }
}

```

```java
package java.lang;

import java.lang.bean.RecursiveActionTest;
import java.lang.bean.RecursiveTaskTest;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinTask;

public class ForkJoinPoolTest {
    public static void main(String[] args) {
        ForkJoinPool pool = new ForkJoinPool();
        long start = System.currentTimeMillis();

        //无返回值累加
        pool.submit(new RecursiveActionTest(1,1000));
        long end = System.currentTimeMillis();
        System.out.println("无返回值累加耗费时间：" + (end - start) + "ms");

        ForkJoinTask<Integer> joinTask = pool.submit(new RecursiveTaskTest(1, 1000));
        Integer sum = joinTask.join();
        System.out.println("并行累加数值:"+ sum);
    }
}

```

## 四、源码阅读
#### 构造方法
**有参构造**：

```java
public ForkJoinPool(int parallelism,
                    ForkJoinWorkerThreadFactory factory,
                    UncaughtExceptionHandler handler,
                    boolean asyncMode) {
    this(checkParallelism(parallelism),
         checkFactory(factory),
         handler,
         asyncMode ? FIFO_QUEUE : LIFO_QUEUE,
         "ForkJoinPool-" + nextPoolId() + "-worker-");
    checkPermission();
}
```

参数说明：

+ parallelism：当前forkJoinPool支持的最大并行数，会校验MAX_CAP（机器支持的最大线程数）。
+ factory：线程工厂，用于创建线程。
+ handler：用于异常处理的拒绝策略。
+ asyncMode：异步模式，true将采用FIFO（先进先出）的模式，false则采用FIFO（后进先出）的模式。



**无参构造：**

```java
public ForkJoinPool() {
    this(Math.min(MAX_CAP, Runtime.getRuntime().availableProcessors()),
         defaultForkJoinWorkerThreadFactory, null, false);
}
```

无参构造：

1、通过获取MAX_CAP 和当前系统允许最大并行数的最小值来设置并行量。

2、设置默认的线程工厂。

3、拒绝策略为空。

4、asyncMode为false。

#### ForkJoinPool的基本组成
forkJoinPool实际是由WorkQueue的数据结构组成，而WorkQueue有分两类队列，一个是由外部提交任务的队列SubmissionQueue，另一个是和Work线程绑定的本地任务队列（里面的任务主要是通过work线程调用fork方法生成），且在主体队列的偶数位。

![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758100657021-d6bfb892-647c-4bc6-8b5e-cfe90b4801ae.png)

图解流程：

1、任务提交会被加入到submissionQueue队列中；

2、当前线程会拿到submissionQueue队列中的任务，fork出多个子任务存入与当前线程绑定的workQueue队列中。

3、当前线程绑定的workQueue队列中无任务，且相邻的submissionQueue队列中也无任务，会去其他线程的WorkQueue中窃取任务。（一般是窃取最旧的任务）

#### 任务队列初始化流程
最开始，workQueues是null状态。在第一次执行的时候，externalSubmit方法中会初始化这个数组。



![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758101317487-12f2ee7a-1225-41cc-9e2b-760d79e6c084.png)



在这之后，还是在externalSubmit方法的for循环中，完成对任务队列的创建，将任务队列创建在偶数索引处。之后将任务写入这个队列：



![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758101325691-5b0df9d6-d789-4935-a31c-793df16fe6f1.png)



此后，任务添加完成，但是没有工作队列进行工作。因此在这之后调用signalWork，通知工作队列开始干活。但是在这个方法执行的过程中，由于工作队列并不存在，没有worker，所以调用tryAddWorker开始创建worker。在createWorker会创建一个worker线程：



![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758101333040-a6877e8f-4bac-4ecb-9c7e-b6567049e10d.png)



但是workQueue还没创建。这是在newthread之后，通过registerWorker创建的，在registerWorker方法中，会在奇数位创建一个workQueue，并将此前创建的线程与之绑定。这样一个worker就成功创建了。

![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758101338874-9db359fc-01cb-4ba6-8791-420583f6939b.png)



这样就完成了worker创建的全过程。



#### 工作流程
当workQueue上的thread启动之后，这个线程就会调用runWorker方法。之后再runWorker方法中有一个死循环，不断的通过scan方法去扫描任务，实际上就是执行窃取过程。如下图所示，这样通过遍历外层workQueues的方式将会从任务队列中窃取任务进行执行。

![](https://cdn.nlark.com/yuque/0/2025/png/22648511/1758101552655-726f9a6b-a8ad-48e6-a7ed-3a007f72f8b2.png)



当执行之后，会通过fork产生新的任务，将这些任务任务添加到工作队列中去。其他线程继续scan，执行。这个过程不断循环，直到任务全部都执行完成，这样就完成了整个计算过程。

