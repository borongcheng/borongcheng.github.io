+++
date = "2015-10-25T08:36:54-07:00"
title = "Spring AOP 详解"

+++
# Spring AOP 详解

# 一、什么是AOP

**文章链接：** 

​		你知道Spring AOP创建Proxy的过程吗？ 

​		https://zhuanlan.zhihu.com/p/413961861

​			AOP，即面向切面编程，可以说是OOP（面向对象编程）的一种补充和完善。OOP引入封装、继承、多态等概念来建立一种对象的层次结构，用于模拟公众行为的一个集合。不过OOP允许开发者定义纵向关系，但并不适合定义横向关系，例如日志功能。

​		日志代码往往横向的散布在所有对象层次中，而与它对应的对象的核心功能毫无关系对于其他类型的代码，如安全性、异常处理和透明的持续性也是如此，这种散步在各处的无关代码被称为横切。

​		在OOP设计中，它导致了大量代码重复，而不利于各个模块的重用；AOP技术恰恰相反，它利用一种称为“横切”的技术，剖解开封装对象内部，并将那些影响多个类的公共行为封装到一个可重用的模块，并将其命名为“Aspect”，即。切面，所谓切面，简单说就是那些与业务无关，却为业务模块所共同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块之间的耦合度，并有利于未来的可操作性和可维护性。

​		使用“横切”技术，AOP把软件系统分成了两个部分：核心关注点和横切关注点。业务处理的主要流程是核心关注点，与之前关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生在核心关注点的多处，而且各处基本相似，比如权限认证、日志、事物。

​		AOP的作用在于分离系统中的各种关注点，将核心关注点和横切关注点分离开来。

<img src="%E7%AC%94%E8%AE%B0%E5%9B%BE%E7%89%87/image-20210926101211751.png" alt="image-20210926101211751" style="zoom:50%;" />

# 二、AOP核心概念

## 1、横切关注点

​		对哪些方法进行拦截，拦截后怎么处理，这些关注点称为横切关注点。

## 2、切面（Aspect）

​		类是对物体特征的抽象，切面是对横切关注点的抽象。

​		个人理解：对需要切的地方抽象出来，然后在切面处理逻辑中对这个切点做前置后置操作。

## 3、连接点（Joinpoint）

​		我们知道了要切哪些方法后，剩下的是什么时候切，在原方法的哪一个执行阶段加入增加代码，这个就是切点。如方法调用前，调用后，发生异常时。

## 4、切入点（Pointcut）

​		要对哪些类中的哪些方法进行增强，进行切割，指的是被增强的方法。要切哪些东西。

## 5、通知（advice）

​		所谓通知指的就是拦截到连接点之后要执行的代码，通知分为前置和后置、异常、最终、环绕五种通知。

## 6、目标对象

​		被一个切面或者多个切面所通知的对象，即为目标对象。

## 7、代理对象

​		AOP代理是AOP框架所生成的对象，该对象是目标对象的代理对象。代理对象能够在目标对象的基础上，在相应的连接点上调用通知。

## 8、织入（weave）

​		将切面应用到目标对象并导致代理对象创建的过程。

## 9、引入（introduction）

​		在不修改原来代码的前提下，引入可以在运行期间为类动态的添加一些方法或字段。

# 三、SpringBoot实现日志切面

```java
@Slf4j
@Component
@Aspect
public class RequestLogAspect {
    @Resource
    private HttpServletRequest request;

    /**
     * 服务端切点
     * */
    @Pointcut("execution(* com.saimo.uavinfomanage.servercontroller.*.*(..))")
    public void webLogServer() {
    }
    /**
     * 客户端切点
     * */
    @Pointcut("execution(* com.saimo.uavinfomanage.clientcontroller.*.*(..))")
    public void webLogClient() {
    }

    /**
     * 声明环绕通知
     */
    @Around("webLogServer()||webLogClient()")
    public Object doAroundServer(ProceedingJoinPoint joinPoint) throws Throwable {
        // 记录下请求内容
        Object result = null;
        Exception exception = null;
        try {
            result = joinPoint.proceed();
        }catch (Exception e){
            exception = e;
        }
        log.info("----------------------------------------------------------------------------------------");
        log.info("----------请求地址 : " + request.getRequestURL().toString());
        log.info("----------请求类型 : " + request.getMethod());
        log.info("----------IP : " + request.getRemoteAddr());
        log.info("----------类方法 : " + joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
        log.info("----------参数 : " + Arrays.toString(joinPoint.getArgs()));
        if (exception != null) {
            if (exception instanceof BusinessException){
              log.error("----------异常 :"+((BusinessException)exception).getMsg());
              throw exception; 
            }else {
                log.error("----------异常 :" + exception.getMessage());
            }
        }else {
            log.info("----------返回 :" + JSON.toJSONString(result));
        }
        log.info("----------------------------------------------------------------------------------------");
        return result;
    }
}
```



# 四、自定义注解事项

## 1、@interface

* 用@interface来声明一个注解
* 其中的每一个方法声明就是声明的一个配置参数
  * 方法的名称就是参数的名称。
  * 返回值的类型就是参数的类型（返回值类型只能是基本类型、Class、String、enum）。
  * 可以通过default来声明参数的默认值。
  * 如果只有一个成员，一般参数名为value

**注意事项：**

​	1、	注解元素必须有值。我们定义注解元素时，经常使用空字符串，0作为默认值。

​	2、	也经常使用负数（-1）表示不存在的含义。

## 2、元注解

​		元注解的作用就是负责注解其他注解。在Java中定义了4个标准的meta-annotation类型，它们被用来提供对其他annotation类型做说明。

1）、Target

2）、Rentention

3）、Documented

4）、Inherited

​		这些注解和它们所支持的类型在java.lang.annotation包中可以看到。

## 3、@Target

**作用：**

​		用于描述注解的使用范围（即被描述的注解可以用在什么地方）

| 所修饰范围                                   | 取值ElementType                                              |
| -------------------------------------------- | ------------------------------------------------------------ |
| package包                                    | PACKAGE                                                      |
| 类、接口、枚举、Annotation类型               | TYPE                                                         |
| 类型成员（方法、构造方法、成员变量、枚举值） | CONSTRUCTOR：用于描述构造器          FIELD：用于描述作用域            METHOD：用于描述方法 |
| 方法参数和本地变量                           | LOCA_VARIABLE：用于描述局部变量        PARAMETER：用于描述参数 |

​		取多个范围可以用逗号隔开

​		例如：@Target({ElementType.METHOD,ElementType.TYPE})

## 4、@Retention

**作用：**

​		表示需要在什么级别保存该注解信息，用于描述注解的生命周期。

| 取值RetentionPolicy | 作用                                                         |
| ------------------- | ------------------------------------------------------------ |
| SOURCE              | 在源文件中有效，即源文件中保留                               |
| CLASS               | 在class文件中有效，即class文件中保留                         |
| RUNTIME             | 在运行时有效，即运行时保留，被加载到程序中，可以被反射机制读取 |

## 5、自定义注解

```java
@Target({ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NotificationRecord {

    NotificationEnum value();

    String key() default "";

    String expand() default "";
}	
```

# 五、注解动态获取方法形参

```java
public Object invoke(ProceedingJoinPoint joinPoint){
  //获取方法上的注解
  MethodSignature signature = (MethodSignature)joinPoint.getSignature();
  NotificationRecord notificationRecord = signature.getMethod().getAnnotation(NotificationRecord.class);
  //获取注解传入的表达式
  String key = notificationRecord.key();
  //创建解析器
  SpelExpressionParser parser = new SpelExpressionParser();
  //将表达式放入解析器
  Expression expression = parser.parseException(key);
  //设置解析上下文（有哪些占位符，以及每种占位符的值）
  StandardEvaluationContext context = new StandardEvaluationContext();
  //通过反射的方法对象获取参数值数组
  Object[] args = joinPoint.getArgs();
  //获取运行时参数的名称
  DefaultParameterNameDiscoverer discoverer = new DefaultParameterNameDiscoverer();
  String[] parameterNames = discoverer.getParameterNames(signature.getMethod);
  //将参数名和参数值一一对应注入到解析上下文中
  for(int i = 0;i < Objects.requireNonNull(parameterNames).length;i++){
    context.setVariable(parameterNames[i],arg[i]);
  }
  //解析，获取解析替换后的结果
  String id = expression.getValue(context).toString();
}
```



