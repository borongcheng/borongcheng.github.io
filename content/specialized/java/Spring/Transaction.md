+++
date = "2024-08-28T11:52:54"
title = "事务"
tags = ["JAVA","Spring"]
draft = false
+++
# 一、定义
1、什么是事务
事务就是一个并发控制单元，要求一次操作序列，要么全部成功要么全部失败。
这些操作要么全部成功，对数据造成影响，要么全部失败对事务不造成影响。在数据库和信息系统中事务一般用于确保数据的一致性。
2、事务的四大特性

- 原子性
   - 事务是一个不可分割的单元，要么全部执行成功，要么全部执行失败，操作序列里面有一个执行失败，那么它之前的执行都需要回滚。
- 一致性
   - 事务的执行结果必须使数据库从一个一致状态转变成另一个一致状态，这意味着事务中的操作或更改必须遵循所有定义好的规则和约束，以确保数据的完整性。
- 隔离性
   - 多个事务同时执行，需要确保各个事务之间被隔离开来，互相之间不受影响。
   - 事务隔离可以防止一些问题，例如：脏读，幻读，不可重复读。
- 持久性
   - 一旦事务提交之后，其对数据库的修改是持久的，就算数据库宕机也能从文件中恢复数据。

3、spring中事务的传播类型
针对事务的传播类型，主要作用就是区分子事务和父事务之间的关系。

- 请求从父事务传播到子事务时，是否共用同一个事务
- 子事务异常时，父事务是否会回滚
- 父事务异常时，子事务是否会回滚
- 父事务捕获了异常之后，父事务是否还会回滚

**常用的三个事务**

- Required
   - spring的默认事务传播类型，子事务加入父事务，共用一个事务。
   - 发生异常，不管是哪个事务中都会回滚，即使子事务抛出异常被父事务捕获也会回滚
- Required_new
   - 子事务不关注父事务，单独创建新事务，两者事务独立，互不干扰。
   - 但是父事务需要注意在调用子方法的时候抛出的异常，会造成父事务回滚，需要捕获。
- Nested
   - 嵌套事务，子事务嵌套父事务使用，子事务不独立依托父事务存在，子事务回滚，父事务在捕获子方法异常的情况下不会回滚。

**不常用的四个事务**

- Supports
   - 支持事务，如果父事务存在则加入父事务，如果父事务不存在则以无事务方式运行
- Not_Supported
   - 不支持事务，如果存在父事务，则将父事务挂起
- Never
   - 要求当前无事务，存在事务则抛出异常
- Mandatory
   - 要求存在事务，不存在则抛出异常

4、spring中事务什么时候会失效
spring事务是通过AOP实现的，事务失效即AOP失效的一些情况。

- @Transactional注解描述的非public方法
- 自调用
   - 类自身调用事务方法，只有通过代理对象调用才会触发事务管理。
- 代理模式限制
   - 如果是jdk动态代理，需要目标对象实现接口。
- 多线程问题
   - spring的事务管理是于线程绑定，如果存在线程上下文切换，事务不会自动传播到新线程中，事务将会失效。
   - 需要通过传递TransactionSynchronizationManager相关的事务信息来确保事务在多线程环境中的正确传播。

# 二、解读
### 1、启用方式
> spring中通常有两种启用事务的方式：XML文件配置、注解配置以及声明式配置

**XML文件配置**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans>
    <!-- 定义一个数据源 -->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">...</bean>
    <!-- 事务管理器 -->
    <bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <!-- 指定数据源 -->
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <!-- 事务模块驱动，指定使用上面定义事务管理器，默认值为 transactionManager -->
    <tx:annotation-driven transaction-manager="txManager"/>
</beans>
```
> 1、设置数据源
> 2、设置事务管理器
> 3、根据事务管理器指定数据源
> 4、启用注解驱动的事务管理器

**注解配置**
```java
@Configuration
@EnableTransactionManagement
public class AppConfig {
    
    @Bean
    public DataSource dataSource() {
        // 配置数据源
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```
> 1、使用@EnableTransactionManagement注解开启事务支持
> 2、配置DataSource数据源
> 3、配置事务管理器类DataSourceTransaction,注入数据源datasource

**声明式配置**
### 2、源码解析
#### EnableTransactionManagement
> spring中的一个注解，用于启用注解驱动的事务管理功能。主要作用是通过AOP在Spring应用中自动配置事务管理。
> **主要功能**
> - 导入事务管理配置
>    - 当你在配置类上使用了@EnableTransactionManagement注解时，Spring会自动导入相关的配置类，这些配置类负责设置事务管理器、代理和其他必要的基础设施。
> - 创建事务代理
>    - 该注解会自动为标记了事务注解（@Transactional）的方法创建代理对象。通过这些代理对象，Spring可以在方法调用前后进行事务管理操作，例如开启事务、提交事务或回滚事务。
> - 配置事务管理器
>    - Spring需要一个PlatformTransactionManager。来实际管理事务。@EnableTransactionManager会自动查找并配置一个合适的事务管理器；如果存在多个事务管理器，可以在@Transactional注解中指定TransactionMananger属性使用哪个事务管理器。
> 
**工作原理**
> - 引入配置类
>    - 该注解会引入ProxyTransactionManagementConfiguration或AspectJTransactionManagementConfiguration配置类，没有指定mode时，默认使用ProxyTransactionManagementConfiguration。
>    - ProxyTransactionManagementConfiguration:
>       - 默认使用的配置类，基于代理实现事务管理，通过代理对象和拦截器，实现了在方法调用前后启动、提交、回滚事务的功能。
>    - AspectJTransactionManagementConfiguration
>       - 可选配置类，使用AspectJ语法实现事务管理，在编译或者运行期织入切面逻辑。

```java

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({TransactionManagementConfigurationSelector.class})。
public @interface EnableTransactionManagement {
    // 表示是否创建基于子类的（CGLIB）代理，而不是标准的基于 Java 接口的代理。
    boolean proxyTargetClass() default false;

    // 指示事务通知应该如何应用。
    AdviceMode mode() default AdviceMode.PROXY;

    // 该注解在相对于其他注解的处理顺序。
    int order() default 2147483647;
}
```
```java
@Override
	protected String[] selectImports(AdviceMode adviceMode) {
        //根据注解的mode属性来选择使用那个配置类，默认使用ProxyTransactionManagementConfiguration
		switch (adviceMode) {
			case PROXY:
				return new String[] {AutoProxyRegistrar.class.getName(), ProxyTransactionManagementConfiguration.class.getName()};
			case ASPECTJ:
				return new String[] {TransactionManagementConfigUtils.TRANSACTION_ASPECT_CONFIGURATION_CLASS_NAME};
			default:
				return null;
		}
	}
```
> 按默认配置，这里往Spring容器里面注入了两个配置类，分别是AutoProxyRegistrar、ProxyTransactionManagementConfiguration

**AutoProxyRegistrar**
> 找到enableTransactionManagement注解，获取属性参数，注册自动代理器，设置代理方式。

```java
@Override
public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
    boolean candidateFound = false; // 标记是否找到合适的候选配置注解
    Set<String> annoTypes = importingClassMetadata.getAnnotationTypes(); // 获取导入类的所有注解类型
    for (String annoType : annoTypes) {
        AnnotationAttributes candidate = AnnotationConfigUtils.attributesFor(importingClassMetadata, annoType); // 获取注解的属性值
        if (candidate == null) {
            continue; // 如果属性值为空，跳过当前注解
        }
        Object mode = candidate.get("mode"); // 获取属性值中的 'mode' 属性
        Object proxyTargetClass = candidate.get("proxyTargetClass"); // 获取属性值中的 'proxyTargetClass' 属性
        if (mode != null && proxyTargetClass != null && AdviceMode.class == mode.getClass() &&
                Boolean.class == proxyTargetClass.getClass()) {
            candidateFound = true; // 找到合适的候选配置注解
            if (mode == AdviceMode.PROXY) { // 如果 'mode' 属性为 AdviceMode.PROXY
                AopConfigUtils.registerAutoProxyCreatorIfNecessary(registry); // 注册自动代理创建器
                if ((Boolean) proxyTargetClass) { // 如果 'proxyTargetClass' 属性为 true
                    AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry); // 强制使用基于类的代理即CGLIB代理
                    return; // 方法结束
                }
            }
        }
    }
    if (!candidateFound) {
        String name = getClass().getSimpleName();
        logger.warn(String.format("%s was imported but no annotations were found " +
                "having both 'mode' and 'proxyTargetClass' attributes of type " +
                "AdviceMode and boolean respectively. This means that auto proxy " +
                "creator registration and configuration may not have occurred as " +
                "intended, and components may not be proxied as expected. Check to " +
                "ensure that %s has been @Import'ed on the same class where these " +
                "annotations are declared; otherwise remove the import of %s " +
                "altogether.", name, name, name)); // 输出警告日志，表示未找到合适的配置注解
}

```
**registerAutoProxyCreatorIfNecessary**
> 注册自动代理器：
> 自动代理器的作用是在Spring中为符合条件的bean创建代理对象。
> 1、检查是否存在自动代理器，存在则比较两者优先级，如果优先级低会升级到更高优先级。
> 2、不存在则直接创建一个新的。

```java
public static BeanDefinition registerAutoProxyCreatorIfNecessary(BeanDefinitionRegistry registry) {
       return registerAutoProxyCreatorIfNecessary(registry, (Object)null);
   }
  public static BeanDefinition registerAutoProxyCreatorIfNecessary(BeanDefinitionRegistry registry, @Nullable Object source) {
       return registerOrEscalateApcAsRequired(InfrastructureAdvisorAutoProxyCreator.class, registry, source);
   }
// @Nullable 注解表示参数可以为 null。方法的目的是确保在 BeanDefinitionRegistry 中
// 注册一个合适的 Auto Proxy Creator (APC)，如果需要的话。
@Nullable
private static BeanDefinition registerOrEscalateApcAsRequired(Class<?> cls, BeanDefinitionRegistry registry,
        @Nullable Object source) {

    // 检查 registry 参数是否为 null，如果为 null 则抛出异常。
    Assert.notNull(registry, "BeanDefinitionRegistry must not be null");

    // 检查注册表中是否已经存在名为 AUTO_PROXY_CREATOR_BEAN_NAME 的 Bean 定义。
    if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
        // 获取当前注册的 APC 的 Bean 定义。
        BeanDefinition apcDefinition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
        
        // 检查当前注册的 APC 类名是否与传入的 cls 不同。
        if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
            // 获取当前 APC 类的优先级。
            int currentPriority = findPriorityForClass(apcDefinition.getBeanClassName());
            // 获取传入的 cls 类的优先级。
            int requiredPriority = findPriorityForClass(cls);
            // 如果当前 APC 的优先级低于传入的 cls 类的优先级，则升级 APC。
            if (currentPriority < requiredPriority) {
                // 将当前 APC 的类名设置为 cls 类的类名。
                apcDefinition.setBeanClassName(cls.getName());
            }
        }
        // 返回 null 表示没有创建新的 APC，而是可能升级了现有的 APC。
        return null;
    }

    // 如果没有现有的 APC，则创建一个新的 RootBeanDefinition 实例。
    RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
    // 设置 Bean 的源信息，用于跟踪配置来源，可以为 null。
    beanDefinition.setSource(source);
    // 设置 APC 的顺序属性为最高优先级。
    beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
    // 设置 Bean 的角色为基础设施角色。
    beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
    // 将新的 APC 注册到 Bean 定义注册表中。
    registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
    // 返回新的 APC 的 Bean 定义。
    return beanDefinition;
}

```
**ProxyTransactionMannageConfiguration**
>  	是spring框架中配置代理事务管理的类之一，它的作用主要用于Spring应用程序中启用基于代理的事务管理。
> 主要作用包括：
> - 启用代理事务管理
>    - 通过@Configuration注解标记自己是个配置类，通常与@EnableAspectJAutoProxy注解一起使用，用于启用基于代理的AOP功能，包括事务注解。
> - 配置事务管理器
>    - 包含对事务管理器的配置，例如定义数据源、事务传播行为、事务超时等。
> - 生成代理对象
>    - 在启用基于代理的AOP功能后，Spring框架会根据配置生成代理对象，用来包裹需要进行事务管理的目标对象，从而实现事务管理的功能。

```java
// 代理事务管理配置类，用于配置代理事务管理相关的组件
@Configuration
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {

    // 定义名为TRANSACTION_ADVISOR_BEAN_NAME的Bean，类型为BeanFactoryTransactionAttributeSourceAdvisor
    @Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor() {
        // 创建BeanFactoryTransactionAttributeSourceAdvisor实例
        BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
        // 设置事务属性源
        advisor.setTransactionAttributeSource(transactionAttributeSource());
        // 设置事务拦截器
        advisor.setAdvice(transactionInterceptor());
        if (this.enableTx != null) {
            // 如果enableTx不为空，设置排序顺序
            advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
        }
        return advisor;
    }

    // 定义事务属性源的Bean
    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public TransactionAttributeSource transactionAttributeSource() {
        // 返回AnnotationTransactionAttributeSource实例
        return new AnnotationTransactionAttributeSource();
    }

    // 定义事务拦截器的Bean
    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public TransactionInterceptor transactionInterceptor() {
        // 创建TransactionInterceptor实例
        TransactionInterceptor interceptor = new TransactionInterceptor();
        // 设置事务属性源
        interceptor.setTransactionAttributeSource(transactionAttributeSource());
        if (this.txManager != null) {
            // 如果txManager不为空，设置事务管理器
            interceptor.setTransactionManager(this.txManager);
        }
        return interceptor;
    }

}

```
> 通过以上代码可以看出来ProxyTransactionManageConfiguration配置类的主要作用是注册3个bean：
> - TransactionAttributeSource
>    - 定义事件属性源，被Pointcut和Advice关联；主要负责提供事务属性，如传播行为，隔离级别等；
>    - 通过getTransactionAttribute方法去获取特定方法的属性，通过这个方法Spring可以确定在调用某个方法时，应该用什么事务规则。
> - TransactionInterceptor
>    - 事务拦截器，关联着一个TransactionAttributeSource对象。
>    - 它通过拦截方法调用并在方法执行前后应用事务管理逻辑，确保方法在事务边界内执行。
>    - 根据TransactionAttributeSource获取到事务属性，根据这些事务属性正确设置事务上下文和行为。
> - BeanFactoryTransactionAttributeSourceAdvisor
>    - 它集成了AOP和事务管理，确保方法在调用中自动应用事务逻辑。

**CanApply**
> spring是通过代理的形式去进行事务管理，事务代码逻辑的开始入口就在代理那块，跟踪代码调用流程：
> - ......
> - initializeBean:初始化bean之后
> - beanPostProcessor：调用bean注册的beanPostProcessor
> - wrapIfNecessary：bean实例化之后检查是否需要代理或者包装
> - findAdvisorsThatCanApply：获取和这个类匹配的加强（及切面）
> - canApply：代理处理事务的入口
>    - 作用是确定是否可以将给定的切面应用到目标类或者方法上。
> - .....

```java
public static boolean canApply(Advisor advisor, Class<?> targetClass, boolean hasIntroductions) {
    // 如果advisor是引介增强类，则直接返回其类过滤器是否匹配目标类
    if (advisor instanceof IntroductionAdvisor) {
        return ((IntroductionAdvisor) advisor).getClassFilter().matches(targetClass);
    }
    // 如果是切点增强类，则进入进一步处理
    else if (advisor instanceof PointcutAdvisor) {
        PointcutAdvisor pca = (PointcutAdvisor) advisor;
        return canApply(pca.getPointcut(), targetClass, hasIntroductions);
    }
    // 对于其他类型的增强，默认返回true，即适用
    else {
        return true;
    }
}

public static boolean canApply(Pointcut pc, Class<?> targetClass, boolean hasIntroductions) {
    // 检查切点不为空
    Assert.notNull(pc, "Pointcut must not be null");
    
    // 如果切点的类过滤器不匹配目标类，则直接返回false
    if (!pc.getClassFilter().matches(targetClass)) {
        return false;
    }
    
    MethodMatcher methodMatcher = pc.getMethodMatcher();
    
    // 如果方法匹配器是TRUE，表示所有方法都匹配，直接返回true
    if (methodMatcher == MethodMatcher.TRUE) {
        return true;
    }

    IntroductionAwareMethodMatcher introductionAwareMethodMatcher = null;
    
    // 如果方法匹配器是IntroductionAwareMethodMatcher的实例，则进行类型转换
    if (methodMatcher instanceof IntroductionAwareMethodMatcher) {
        introductionAwareMethodMatcher = (IntroductionAwareMethodMatcher) methodMatcher;
    }

    // 获取目标类及其所有接口的集合
    Set<Class<?>> classes = new LinkedHashSet<>(ClassUtils.getAllInterfacesForClassAsSet(targetClass));
    classes.add(targetClass);
    
    for (Class<?> clazz : classes) {
        // 获取当前类的所有声明的方法
        Method[] methods = ReflectionUtils.getAllDeclaredMethods(clazz);
        
        for (Method method : methods) {
            // 检查方法匹配器是否匹配当前方法
            if ((introductionAwareMethodMatcher != null &&
                 introductionAwareMethodMatcher.matches(method, targetClass, hasIntroductions)) ||
                //进入方法，选择TransactionAttributeSourcePointcut实现
                methodMatcher.matches(method, targetClass)) {
                return true;
            }
        }
    }

    // 如果没有找到匹配的方法，则返回false
    return false;
}
```
> 进一步检查切点是否作用与目标类上，主要通过classFilter()类过滤器和methodMatcher方法匹配器判断。
> - classFilter
>    - 用于检查某个类是否符合切点。
> - methodMatcher
>    - 用于检查类的某个方法是否符合切点

**TransactionAttributeSourcePointcut**
> spring框架中的一个特殊的切点类，用于确定哪些方法应该用事务增强（例如，事务管理），主要用来识别带有特定事务属性的方法。
> TransactionAttributeSourcePointcut结合TransactionAttributeSource来决定哪些方法需要事务管理。这些方法通常会通过事务注解@Transactional或者XML去显式的指定其事务属性。
> TransactionAttributeSourcePointcut作用如下：
> 1、匹配方法：检查目标类的方法是否具有事务属性
> 2、集成事务管理器：如果一个方法具有事务属性，那spring AOP会拦截该方法的调用，并在调用前后应用相应的事务处理。

```java
@Override
public boolean matches(Method method, @Nullable Class<?> targetClass) {
    // 如果目标类不为空并且目标类是TransactionalProxy的子类或实现类，返回false。
    // 这意味着如果目标类本身已经是一个事务代理对象，则不需要再进行事务增强。
    if (targetClass != null && TransactionalProxy.class.isAssignableFrom(targetClass)) {
        return false;
    }
    
    // 获取事务属性源（TransactionAttributeSource）。
    // 这是用于获取方法上的事务属性的组件。
    TransactionAttributeSource tas = getTransactionAttributeSource();
    
    // 如果事务属性源为null，或者通过事务属性源获取到的方法事务属性不为null，则认为该方法匹配。
    // 即，如果tas为null，表示没有特定的事务属性源，所有方法默认匹配；
    // 如果tas.getTransactionAttribute(method, targetClass)返回非null，
    // 表示该方法有特定的事务属性，也认为该方法匹配。
    return (tas == null || tas.getTransactionAttribute(method, targetClass) != null);
}
```
> 1、排除TransactionProxy或其子类，该类已被事务代理，不需要再次应用事务增强
> 2、获取事务属性，如果没有配置事务源或者通过事务源返回了事务属性则匹配成功。

**getTransactionAttribute**
> 获取传入方法的事务属性；
> 1、过滤object方法
> 2、获取缓存值返回
> 3、不存在缓存值，计算属性，将属性缓存并返回。

```java
@Override
@Nullable
public TransactionAttribute getTransactionAttribute(Method method, @Nullable Class<?> targetClass) {
    // 如果该方法是Object类中声明的方法，则返回null，表示没有事务属性。
    if (method.getDeclaringClass() == Object.class) {
        return null;
    }

    // 首先检查是否有缓存值。
    Object cacheKey = getCacheKey(method, targetClass);
    Object cached = this.attributeCache.get(cacheKey);
    if (cached != null) {
        // 缓存值可能是表示没有事务属性的规范值，或者是实际的事务属性。
        if (cached == NULL_TRANSACTION_ATTRIBUTE) {
            return null; // 返回null表示没有事务属性。
        }
        else {
            return (TransactionAttribute) cached; // 返回缓存的事务属性。
        }
    }
    else {
        // 需要计算事务属性。
        TransactionAttribute txAttr = computeTransactionAttribute(method, targetClass);
        // 将计算得到的事务属性放入缓存。
        if (txAttr == null) {
             // 如果当前方法上没有事务属性，则缓存一个表示空事务属性的对象
            this.attributeCache.put(cacheKey, NULL_TRANSACTION_ATTRIBUTE);
        }
        else {
            String methodIdentification = ClassUtils.getQualifiedMethodName(method, targetClass);
            if (txAttr instanceof DefaultTransactionAttribute) {
                // 如果生成的事务属性是DefaultTransactionAttribute类型的，则将方法签名设置到其descriptor属性中
                ((DefaultTransactionAttribute) txAttr).setDescriptor(methodIdentification);
            }
            if (logger.isDebugEnabled()) {
                logger.debug("Adding transactional method '" + methodIdentification + "' with attribute: " + txAttr);
            }
            this.attributeCache.put(cacheKey, txAttr);
        }
        return txAttr; // 返回计算得到的事务属性。
    }
}
```
**computeTransactionAttribute**
> 该方法在获取事务属性过程中起着核心作用，它的主要功能是根据给定的方法和目标类，计算出该方法的事务属性。
> 方法一般作用和步骤：
> - 检查方法级别的注解
>    - 首先检查方法本身是否存在注解，如@Transactional 注解
>    - 如果找到注解，解析该注解提取属性。
> - 检查类级别的注解
>    - 如果方法上没找到注解，则检查声明此方法的类或接口上是否有事务性注解。
>    - 类注解可以为类中所有方法提供默认事务属性。
> - 继承与几口处理
>    - 处理方法重载、继承和实现的情况
>    - 确保父类或者实现接口上的事务注解能够正确的应用与子类或者实现类的方法。
> - 默认值的应用
>    - 如果没找到显式的事务注解，可能会应用一些默认的事务属性。
> - 返回事务属性
>    - 根据上述检查和解析结果，构建并返回一个TransactionAttribute对象，描述该方法的事务行为。
>    - 如果没找到则返回null

```java
@Nullable
protected TransactionAttribute computeTransactionAttribute(Method method, @Nullable Class<?> targetClass) {
    // 如果仅允许公共方法并且该方法不是公共的，则返回 null。
    if (allowPublicMethodsOnly() && !Modifier.isPublic(method.getModifiers())) {
        return null;
    }

    // 忽略 CGLIB 动态代理的子类，获取实际的用户类。
    // 如果 targetClass 不为空，则获取用户类，否则 userClass 为 null。
    Class<?> userClass = (targetClass != null ? ClassUtils.getUserClass(targetClass) : null);

    // 方法可能在一个接口上定义，但我们需要从目标类中获取属性。
    // 如果 targetClass 为空，则方法保持不变。
    Method specificMethod = ClassUtils.getMostSpecificMethod(method, userClass);

    // 如果我们处理的是带有泛型参数的方法，找到原始方法。
    specificMethod = BridgeMethodResolver.findBridgedMethod(specificMethod);

    // 首先尝试从目标类中的特定方法上查找事务属性。
    TransactionAttribute txAttr = findTransactionAttribute(specificMethod);
    if (txAttr != null) {
        return txAttr;
    }

    // 其次尝试从目标类自身查找事务属性。
    txAttr = findTransactionAttribute(specificMethod.getDeclaringClass());
    if (txAttr != null && ClassUtils.isUserLevelMethod(method)) {
        return txAttr;
    }

    // 如果特定方法不是传入的方法，回退到检查原方法。
    if (specificMethod != method) {
        // 尝试从原方法中查找事务属性。
        txAttr = findTransactionAttribute(method);
        if (txAttr != null) {
            return txAttr;
        }
        // 最后回退到检查原方法的声明类。
        txAttr = findTransactionAttribute(method.getDeclaringClass());
        if (txAttr != null && ClassUtils.isUserLevelMethod(method)) {
            return txAttr;
        }
    }

    // 如果没有找到任何事务属性，返回 null。
    return null;
}
```
**findTransactionAttribute**
> 根据给定方法，查找并返回方法上定义的事务属性。

```java
protected TransactionAttribute findTransactionAttribute(Method method) {
		return determineTransactionAttribute(method);
	}
	protected TransactionAttribute determineTransactionAttribute(AnnotatedElement ae) {
		for (TransactionAnnotationParser annotationParser : this.annotationParsers) {
			TransactionAttribute attr = annotationParser.parseTransactionAnnotation(ae);
			if (attr != null) {
				return attr;
			}
		}
		return null;
	}
	public TransactionAttribute parseTransactionAnnotation(AnnotatedElement ae) {
		AnnotationAttributes attributes = AnnotatedElementUtils.findMergedAnnotationAttributes(
				ae, Transactional.class, false, false);
		if (attributes != null) {
			return parseTransactionAnnotation(attributes);
		}
		else {
			return null;
		}
	}
public TransactionAttribute parseTransactionAnnotation(AnnotatedElement ae) {
    // 判断目标方法上是否存在@Transactional注解，如果不存在，则直接返回
    AnnotationAttributes attributes = AnnotatedElementUtils
        .findMergedAnnotationAttributes(ae, Transactional.class, false, false);
    if (attributes != null) {
        // 如果目标方法上存在@Transactional注解，则获取注解值，并且封装为TransactionAttribute返回
        return parseTransactionAnnotation(attributes);
    } else {
        return null;
    }
}

protected TransactionAttribute parseTransactionAnnotation(
        AnnotationAttributes attributes) {
    RuleBasedTransactionAttribute rbta = new RuleBasedTransactionAttribute();
    // 获取注解上的propagation值
    Propagation propagation = attributes.getEnum("propagation");
    rbta.setPropagationBehavior(propagation.value());
    // 获取注解上的isolation属性值
    Isolation isolation = attributes.getEnum("isolation");
    rbta.setIsolationLevel(isolation.value());
    // 获取注解上的timeout属性值
    rbta.setTimeout(attributes.getNumber("timeout").intValue());
    // 获取注解上的readOnly属性值
    rbta.setReadOnly(attributes.getBoolean("readOnly"));
    // 获取注解上的value属性值
    rbta.setQualifier(attributes.getString("value"));
    ArrayList<RollbackRuleAttribute> rollBackRules = new ArrayList<>();
    // 获取注解上的rollbackFor属性列表
    Class<?>[] rbf = attributes.getClassArray("rollbackFor");
    for (Class<?> rbRule : rbf) {
        RollbackRuleAttribute rule = new RollbackRuleAttribute(rbRule);
        rollBackRules.add(rule);
    }
    // 获取注解上的rollbackForClassName属性列表
    String[] rbfc = attributes.getStringArray("rollbackForClassName");
    for (String rbRule : rbfc) {
        RollbackRuleAttribute rule = new RollbackRuleAttribute(rbRule);
        rollBackRules.add(rule);
    }
    // 获取注解上的noRollbackFor属性列表
    Class<?>[] nrbf = attributes.getClassArray("noRollbackFor");
    for (Class<?> rbRule : nrbf) {
        NoRollbackRuleAttribute rule = new NoRollbackRuleAttribute(rbRule);
        rollBackRules.add(rule);
    }
    // 获取注解上的noRollbackForClassName属性列表
    String[] nrbfc = attributes.getStringArray("noRollbackForClassName");
    for (String rbRule : nrbfc) {
        NoRollbackRuleAttribute rule = new NoRollbackRuleAttribute(rbRule);
        rollBackRules.add(rule);
    }
    rbta.getRollbackRules().addAll(rollBackRules);
    return rbta;
}
```
**invoke**
> ....
> createTransactionIfNecessary：
> prepareTransactionInfo：
> completeTransactionAfterThrowing：
> commitTransactionAfterReturing：

```java
public Object invoke(final MethodInvocation invocation) throws Throwable {
		Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
		// 往下看
		return invokeWithinTransaction(invocation.getMethod(), targetClass, invocation::proceed);
	}
// 方法在事务内进行调用，可能会抛出 Throwable 异常
protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
        final InvocationCallback invocation) throws Throwable {

    // 获取事务属性源（TransactionAttributeSource）
    TransactionAttributeSource tas = getTransactionAttributeSource();
    
    // 根据方法和目标类获取事务属性，如果事务属性源为 null，则事务属性也为 null
    final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
    
    // 确定使用哪个事务管理器
    final PlatformTransactionManager tm = determineTransactionManager(txAttr);
    
    // 获取方法标识，用于日志等目的
    final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

    //声明式事务
    // 如果没有事务属性或者事务管理器不是回调优先的事务管理器
    if (txAttr == null || !(tm instanceof CallbackPreferringPlatformTransactionManager)) {
        // 使用标准的事务划分方式，通过 getTransaction 和 commit/rollback 进行处理
        TransactionInfo txInfo = createTransactionIfNecessary(tm, txAttr, joinpointIdentification);
        Object retVal = null;
        try {
            // 这是一个环绕通知：调用拦截链中的下一个拦截器
            // 这通常会导致调用目标对象
            retVal = invocation.proceedWithInvocation();
        }
        catch (Throwable ex) {
            // 目标调用异常处理
            completeTransactionAfterThrowing(txInfo, ex);
            throw ex;
        }
        finally {
            //清除事务信息
            cleanupTransactionInfo(txInfo);
        }
        //提交事务
        commitTransactionAfterReturning(txInfo);
        return retVal;
    }
    //编程式事务
    else {
        // 定义一个用于保存异常的持有者（ThrowableHolder）
        final ThrowableHolder throwableHolder = new ThrowableHolder();

        // 这是一个回调优先的事务管理器：传递一个 TransactionCallback 进去
        try {
            Object result = ((CallbackPreferringPlatformTransactionManager) tm).execute(txAttr, status -> {
                TransactionInfo txInfo = prepareTransactionInfo(tm, txAttr, joinpointIdentification, status);
                try {
                    return invocation.proceedWithInvocation();
                }
                catch (Throwable ex) {
                    if (txAttr.rollbackOn(ex)) {
                        // 如果是一个需要回滚的运行时异常
                        if (ex instanceof RuntimeException) {
                            throw (RuntimeException) ex;
                        }
                        else {
                            throw new ThrowableHolderException(ex);
                        }
                    }
                    else {
                        // 正常返回值，将导致提交
                        throwableHolder.throwable = ex;
                        return null;
                    }
                }
                finally {
                    cleanupTransactionInfo(txInfo);
                }
            });

            // 检查结果状态：它可能指示一个需要重新抛出的 Throwable
            if (throwableHolder.throwable != null) {
                throw throwableHolder.throwable;
            }
            return result;
        }
        catch (ThrowableHolderException ex) {
            throw ex.getCause();
        }
        catch (TransactionSystemException ex2) {
            if (throwableHolder.throwable != null) {
                logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
                ex2.initApplicationException(throwableHolder.throwable);
            }
            throw ex2;
        }
        catch (Throwable ex2) {
            if (throwableHolder.throwable != null) {
                logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
            }
            throw ex2;
        }
    }
}
```
**createTransactionIfNecessary**
> 作用是在需要时创建事务。主要任务是准备并启动一个新的事务，或者参与一个现有的事务。
> 1、是否确定需要事务
> 根据传入的事务属性TransactionAttribute，判断是否需要创建一个新的事务，如果属性表明不需要事务，该方法会直接返回。
> 
> 2、创建事务状态(TransactionStatus)
> 如果需要创建事务，它会调用事务管理器getTransaction方法来获取事务状态对象(TransactionStatus)。
> 这个类主要提供对事务状态的控制和查询，使得开发人员能够在编译过程中准确地管理事务的生命周期，包括事务的开始、提交、回滚以及其他状态检查。
> 主要职责和作用：
> 1）、判断事务是否处于新创建状态
> 用于告诉我们当前事务是否时新创建的，还是一个现有事务的一部分。这对于处理事务传播行为尤其重要。
> 2）、标记事务的完成状态
> 提供了方法来标记事务是否已经完成，以避免重复提交或回滚
> 3）、回滚状态管理
> 它可以标记事务为回滚状态，让事务管理器知道在提交的时候回滚事务，而不是提交。
> 4）、事务嵌套和保存点管理
> 会包含相关的方法和状态，用于处理事务的嵌套层次和保存点操作。
> 5）、只读事务标记
> 它可以指示当前事务是否是只读。这对优化数据库资源管理有帮助。
> 
> 3、保存事务信息
> 将事务信息保存到TransactionInfo对象中。
> 这包括事务管理器、事务属性、事务状态以及其他相关信息。TransactionInfo用于在后续处理过程中跟踪和管理事务。
> 
> 4、绑定事务到当前线程
> 通常会将TransactionInfo绑定到当前线程的上下文，使得后续方法调用中可以方便的访问和操作事务信息。这对支持事务传播行为（嵌套事务或事务参与）非常重要。
> 
> 5、返回事务信息
> 最终返回TransactionInfo对象，以便调用方能够继续处理事务逻辑。

```java
protected TransactionInfo createTransactionIfNecessary(@Nullable PlatformTransactionManager tm,
			@Nullable TransactionAttribute txAttr, final String joinpointIdentification) {

	// 如果事务属性存在且没有指定事务名称，则使用方法标识作为事务名称。
	if (txAttr != null && txAttr.getName() == null) {
		// 创建一个新的 DelegatingTransactionAttribute 实例，重写 getName 方法
		// 使其返回 joinpointIdentification 作为事务名称。
		txAttr = new DelegatingTransactionAttribute(txAttr) {
			@Override
			public String getName() {
				return joinpointIdentification;
			}
		};
	}

	TransactionStatus status = null; // 初始化事务状态为 null
	if (txAttr != null) { // 如果事务属性不为空
		if (tm != null) { // 并且事务管理器不为空
			// 使用事务管理器根据事务属性获取事务状态
			status = tm.getTransaction(txAttr);
		} else { // 如果事务管理器为空
			// 如果日志记录级别为 debug，则记录一条调试信息
			if (logger.isDebugEnabled()) {
				logger.debug("Skipping transactional joinpoint [" + joinpointIdentification +
						"] because no transaction manager has been configured");
			}
		}
	}

	// 调用 prepareTransactionInfo 方法准备事务信息，并返回 TransactionInfo 对象
	return prepareTransactionInfo(tm, txAttr, joinpointIdentification, status);
}
```
**1、tm.getTransaction**
> 通过事务源初始化事务状态。
> 主要流程：
> - doGetTransaction
>    - 通过这个方法获取当前线程关联的事务对象。
> - 缓存日志标志
>    - 一次获取当参数传入避免重复检查
> - 处理空事务定义
>    - 如果事务定义为空，则返回默认事务定义DefaultTransactionDefinition
> - 检查现有事务
>    - 如果存在事务，调用handeExistingTransaction
> - 检查事务超时时间
>    - 确保事务定义中的超时时间有效
> - 单独处理mandatory传播的事务
>    - 如果存在事务则抛出异常
> - 处理需要创建新事务的传播机制
>    - Required、Required_New、Nested，开启新事务，并处理异常恢复
> - 处理其他情况
>    - 对于事务支持与不支持的情况，处理自定义隔离级别的日志告警，并返回事务状态。

```java
@Override
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException {
    //获取事务
    Object transaction = doGetTransaction();

    // Cache debug flag to avoid repeated checks.
    //缓存日志记录器的调试标志，以避免重复检查
    boolean debugEnabled = logger.isDebugEnabled();

    if (definition == null) {
        // Use defaults if no transaction definition given.
        definition = new DefaultTransactionDefinition();
    }

    //判断当前是否存在事务
    if (isExistingTransaction(transaction)) {
        // Existing transaction found -> check propagation behavior to find out how to behave.
        //如果当前有事务，则处理该事务，返回TransactionStatus
        return handleExistingTransaction(definition, transaction, debugEnabled);
    }

    // Check definition settings for new transaction.
    //检查事务中定义的超时时间是否合法
    if (definition.getTimeout() < TransactionDefinition.TIMEOUT_DEFAULT) {
        //超时时间只能小于默认值，大于则抛出异常
        throw new InvalidTimeoutException("Invalid transaction timeout", definition.getTimeout());
    }

    // No existing transaction found -> check propagation behavior to find out how to proceed.
    //处理事务传播行为Propagation_Mandatory  不存在事务则抛出异常
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
        throw new IllegalTransactionStateException(
                "No existing transaction found for transaction marked with propagation 'mandatory'");
    }
        //处理需要新建事务的情况，Required、Required_new、Nested
    else if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
            definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
            definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
        //挂起当前事务，并保存事务资源
        SuspendedResourcesHolder suspendedResources = suspend(null);
        //根据日志级别决定是否输出调试信息
        if (debugEnabled) {
            logger.debug("Creating new transaction with name [" + definition.getName() + "]: " + definition);
        }
        try {
            // 判断是否需要新建事务同步
            boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
            //创建新的事务状态DefaultTransactionStatus
            DefaultTransactionStatus status = newTransactionStatus(
                    definition, transaction, true, newSynchronization, debugEnabled, suspendedResources);
            //开启新事物
            doBegin(transaction, definition);
            //准备事务同步回调
            prepareSynchronization(status, definition);
            返回新的事务状态
            return status;
        }
        catch (RuntimeException | Error ex) {
            resume(null, suspendedResources);
            throw ex;
        }
    }
        //处理其他事务传播行为情况，例如SUPPORTS、NOT_SUPPORTED、NEVER
    else {
        // Create "empty" transaction: no actual transaction, but potentially synchronization.
        // 如果指定了自定义的隔离级别，但是没有实际启动事务，记录告警日志
        if (definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT && logger.isWarnEnabled()) {
            logger.warn("Custom isolation level specified but no actual transaction initiated; " +
                    "isolation level will effectively be ignored: " + definition);
        }
        //判断是否需要启动事务同步
        boolean newSynchronization = (getTransactionSynchronization() == SYNCHRONIZATION_ALWAYS);
        //返回一个准备好的事务，这时没有实际启动事务，但是可能会进行事务同步
        return prepareTransactionStatus(definition, null, true, newSynchronization, debugEnabled, null);
    }
}
```
**handleExistingTransaction**
> 处理当前线程已经绑定事务的情况。
> 这个方法会根据事务的传播行为、隔离级别等事务定义参数来决定如何处理现有事务.
> 大致逻辑处理如下：
> - Requeired
>    - 如果当前已有事务存在，直接参与一个现有事务；
> - Required_New
>    - 挂起当前事务，创建一个新事务。
> - Nested
>    - 如果底层的事务管理器支持嵌套事务，则在现有事务中创建一个嵌套事务。
> - Supprts、Not_Supported、Never等
>    - 这些传播行为可能决定不创建新的事务，或根据传播行为决定参与不参与现有事务。

```java
private TransactionStatus handleExistingTransaction(
			TransactionDefinition definition, Object transaction, boolean debugEnabled)
			throws TransactionException {
    //如果传播行为是Never 则抛出异常
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NEVER) {
        throw new IllegalTransactionStateException(
                "Existing transaction found for transaction marked with propagation 'never'");
    }
    //
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NOT_SUPPORTED) {
        if (debugEnabled) {
            logger.debug("Suspending current transaction");
        }
        //如果当前传播行为是not support 则挂起事务以无事务方式执行
        Object suspendedResources = suspend(transaction);
        boolean newSynchronization = (getTransactionSynchronization() == SYNCHRONIZATION_ALWAYS);
        //没有事务直接返回无事务状态
        return prepareTransactionStatus(
                definition, null, false, newSynchronization, debugEnabled, suspendedResources);
    }

    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW) {
        //如果事务的传播行为是Requried_new 则挂起当前事务，创建一个新事务
        if (debugEnabled) {
            logger.debug("Suspending current transaction, creating new transaction with name [" +
                    definition.getName() + "]");
        }
        SuspendedResourcesHolder suspendedResources = suspend(transaction);
        try {
            boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
            DefaultTransactionStatus status = newTransactionStatus(
                    definition, transaction, true, newSynchronization, debugEnabled, suspendedResources);
            doBegin(transaction, definition);
            prepareSynchronization(status, definition);
            return status;
        }
        catch (RuntimeException | Error beginEx) {
            resumeAfterBeginException(transaction, suspendedResources, beginEx);
            throw beginEx;
        }
    }

    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
        //如果事务的传播行为是nested，则启动一个嵌套事务
        if (!isNestedTransactionAllowed()) {
            throw new NestedTransactionNotSupportedException(
                    "Transaction manager does not allow nested transactions by default - " +
                    "specify 'nestedTransactionAllowed' property with value 'true'");
        }
        if (debugEnabled) {
            logger.debug("Creating nested transaction with name [" + definition.getName() + "]");
        }
        if (useSavepointForNestedTransaction()) {
            // Create savepoint within existing Spring-managed transaction,
            // through the SavepointManager API implemented by TransactionStatus.
            // Usually uses JDBC 3.0 savepoints. Never activates Spring synchronization.
            DefaultTransactionStatus status =
                    prepareTransactionStatus(definition, transaction, false, false, debugEnabled, null);
            status.createAndHoldSavepoint();
            return status;
        }
        else {
            // Nested transaction through nested begin and commit/rollback calls.
            // Usually only for JTA: Spring synchronization might get activated here
            // in case of a pre-existing JTA transaction.
            //其他传播方式默认参与现有事务
            boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
            DefaultTransactionStatus status = newTransactionStatus(
                    definition, transaction, true, newSynchronization, debugEnabled, null);
            doBegin(transaction, definition);
            prepareSynchronization(status, definition);
            return status;
        }
    }

    // Assumably PROPAGATION_SUPPORTS or PROPAGATION_REQUIRED.
    if (debugEnabled) {
        logger.debug("Participating in existing transaction");
    }
    if (isValidateExistingTransaction()) {
        if (definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT) {
            Integer currentIsolationLevel = TransactionSynchronizationManager.getCurrentTransactionIsolationLevel();
            if (currentIsolationLevel == null || currentIsolationLevel != definition.getIsolationLevel()) {
                Constants isoConstants = DefaultTransactionDefinition.constants;
                throw new IllegalTransactionStateException("Participating transaction with definition [" +
                        definition + "] specifies isolation level which is incompatible with existing transaction: " +
                        (currentIsolationLevel != null ?
                                isoConstants.toCode(currentIsolationLevel, DefaultTransactionDefinition.PREFIX_ISOLATION) :
                                "(unknown)"));
            }
        }
        if (!definition.isReadOnly()) {
            if (TransactionSynchronizationManager.isCurrentTransactionReadOnly()) {
                throw new IllegalTransactionStateException("Participating transaction with definition [" +
                        definition + "] is not marked as read-only but existing transaction is");
            }
        }
    }
    boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
    return prepareTransactionStatus(definition, transaction, false, newSynchronization, debugEnabled, null);
}
```
**prepareSynchronization**
> 在事务管理中扮演重要角色，主要负责为事务同步过程做准备。
> 事务同步是指在事务的生命周期内，与当前事务关联的资源和回调函数进行协调，以确保事务的一致性和正确性。

```java
protected final DefaultTransactionStatus prepareTransactionStatus(
        TransactionDefinition definition, @Nullable Object transaction, boolean newTransaction,
        boolean newSynchronization, boolean debug, @Nullable Object suspendedResources) {

    DefaultTransactionStatus status = newTransactionStatus(
            definition, transaction, newTransaction, newSynchronization, debug, suspendedResources);
    prepareSynchronization(status, definition);
    return status;
}

protected void prepareSynchronization(DefaultTransactionStatus status, TransactionDefinition definition) {
	//检查事务状态是否是新的同步状态	
    if (status.isNewSynchronization()) {
            //设置当前线程的事务活动状态
			TransactionSynchronizationManager.setActualTransactionActive(status.hasTransaction());
            //根据传入的事务定义设置当前事务的隔离级别
			TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(
					definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT ?
							definition.getIsolationLevel() : null);
            //设置当前事务是否为只读
			TransactionSynchronizationManager.setCurrentTransactionReadOnly(definition.isReadOnly());
            //设置当前事务的名称
			TransactionSynchronizationManager.setCurrentTransactionName(definition.getName());
            //这里通常注册需要在事务提交或回滚时调用的回调函数
			TransactionSynchronizationManager.initSynchronization();
		}
	}
```
**doBegin**
> 确保了一个新的JDBC事务能够被正确初始化，并与当前线程绑定以支持事务管理。

```java
@Override
	protected void doBegin(Object transaction, TransactionDefinition definition) {
        //将传入的事务对象转换为DataSource TransactionObject类型
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
		Connection con = null;

		try {
            //检查事务对象是否有连接持有者，或者连接持有者是否已与事务同步
			if (!txObject.hasConnectionHolder() ||
					txObject.getConnectionHolder().isSynchronizedWithTransaction()) {
                //获取新的数据库连接
				Connection newCon = obtainDataSource().getConnection();
				if (logger.isDebugEnabled()) {
					logger.debug("Acquired Connection [" + newCon + "] for JDBC transaction");
				}
                //将新的连接包装到ConnnectHolder中，并设置为事务对象的连接持有者
				txObject.setConnectionHolder(new ConnectionHolder(newCon), true);
			}

            //将连接持有者标记为事务同步
			txObject.getConnectionHolder().setSynchronizedWithTransaction(true);
            //获取实际的数据库连接
			con = txObject.getConnectionHolder().getConnection();

            //准备连接的事务隔离级别，并保存之前的隔离级别
			Integer previousIsolationLevel = DataSourceUtils.prepareConnectionForTransaction(con, definition);
			txObject.setPreviousIsolationLevel(previousIsolationLevel);

			// Switch to manual commit if necessary. This is very expensive in some JDBC drivers,
			// so we don't want to do it unnecessarily (for example if we've explicitly
			// configured the connection pool to set it already).

            //如果连接是自动提交模式
            if (con.getAutoCommit()) {
				txObject.setMustRestoreAutoCommit(true);
				if (logger.isDebugEnabled()) {
					logger.debug("Switching JDBC Connection [" + con + "] to manual commit");
				}
				con.setAutoCommit(false);
			}

            //准备事务性连接，以便满足事务定义的要求
			prepareTransactionalConnection(con, definition);
            // 将连接持有者标记为活动事务
			txObject.getConnectionHolder().setTransactionActive(true);

            //确定事务的超时时间
			int timeout = determineTimeout(definition);
			if (timeout != TransactionDefinition.TIMEOUT_DEFAULT) {
				txObject.getConnectionHolder().setTimeoutInSeconds(timeout);
			}

			// Bind the connection holder to the thread.
            //如果这是一个新的连接持有者，则将其绑定到当前线程
			if (txObject.isNewConnectionHolder()) {
				TransactionSynchronizationManager.bindResource(obtainDataSource(), txObject.getConnectionHolder());
			}
		}

		catch (Throwable ex) {
            //发生异常，并且这是一个新的连接持有者，则释放并清空连接持有者。
			if (txObject.isNewConnectionHolder()) {
				DataSourceUtils.releaseConnection(con, obtainDataSource());
				txObject.setConnectionHolder(null, false);
			}
            //抛出无法创建事务的异常
			throw new CannotCreateTransactionException("Could not open JDBC Connection for transaction", ex);
		}
	}
```
**2、prepareTransactionInfo**
> 构建事务信息
> 这段代码主要作用是返回一个TransactionInfo对象，包含与当前事务相关的信息。如果需要事务支持，则设置新的事务状态，并将TransactionInfo绑定到当前线程，即使不需要事务也会进行正常绑定，确保事务的正确管理。

```java
protected TransactionInfo prepareTransactionInfo(@Nullable PlatformTransactionManager tm,
			@Nullable TransactionAttribute txAttr, String joinpointIdentification,
			@Nullable TransactionStatus status) {

        //创建一个新的Transaction 对象，该对象将保存有关的事务信息
		TransactionInfo txInfo = new TransactionInfo(tm, txAttr, joinpointIdentification);

        //如果事务属性不为空，则表示该方法需要事务
        if (txAttr != null) {
			// We need a transaction for this method...
            //如果日志级别为TRACE，记录一条跟踪消息，表明正在获取事务
			if (logger.isTraceEnabled()) {
				logger.trace("Getting transaction for [" + txInfo.getJoinpointIdentification() + "]");
			}
			// The transaction manager will flag an error if an incompatible tx already exists.
			//设置新的事务状态，如果已经存在不兼容的事务，事务管理器会标记错误
            txInfo.newTransactionStatus(status);
		}
		else {
			// The TransactionInfo.hasTransaction() method will return false. We created it only
			// to preserve the integrity of the ThreadLocal stack maintained in this class.
			//如果事务属性为空，表示该方法不需要事务。
            //这里记录一条跟踪消息，表明不需要为该方法创建事务
            if (logger.isTraceEnabled())
				logger.trace("Don't need to create transaction for [" + joinpointIdentification +
						"]: This method isn't transactional.");
		}

		// We always bind the TransactionInfo to the thread, even if we didn't create
		// a new transaction here. This guarantees that the TransactionInfo stack
		// will be managed correctly even if no transaction was created by this aspect.
		//不管需不需要创建事务，我们也总是将TransactionInfo绑定到线程到当前线程。
        txInfo.bindToThread();
		return txInfo;
	}
```
**completeTransactionAfterThrowing**
> 主要作用是在发生异常的情况下，能够正确的处理事务，包括回滚事务和清理相关资源，以保持数据的完整性和一致性。
> 主要作用：
> - 捕获异常
>    - 当事务中的某个操作抛出异常时，事务管理器会捕获到这个异常
> - 标记回滚
>    - completeTransactionAfterThrowing方法会根据捕获到的异常类型决定是否需要回滚事务。一般情况下，事务管理器会选择回滚事务，以保证数据的一致性。
> - 执行回滚
>    - 如果需要回滚，事务管理器就会调用回滚操作，将所有已经进行的数据库操作撤销，恢复到事务开始前的状态。
> - 清理资源
>    - 在回滚之后，方法还负责清理事务相关的资源，比如关闭数据库连接，释放锁等。
> - 重新抛出异常
>    - 最后，该方法会重新抛出原始异常，以便让上层调用者知道事务过程出现了问题，并采取适当的措施（如记录日志、通知用户等）。

```java
protected void completeTransactionAfterThrowing(@Nullable TransactionInfo txInfo, Throwable ex) {
		//检查transactionInfo和transactionStatus是否为空
        if (txInfo != null && txInfo.getTransactionStatus() != null) {
            //根据日志级别决定是否打印追踪日志
			if (logger.isTraceEnabled()) {
				logger.trace("Completing transaction for [" + txInfo.getJoinpointIdentification() +
						"] after exception: " + ex);
			}
            //检查事务属性是否存在，以及检查异常是否触发回滚
			if (txInfo.transactionAttribute != null && txInfo.transactionAttribute.rollbackOn(ex)) {
				try {
                    //执行回滚操作
					txInfo.getTransactionManager().rollback(txInfo.getTransactionStatus());
				}
				catch (TransactionSystemException ex2) {
                    //处理回滚中抛出的异常
					logger.error("Application exception overridden by rollback exception", ex);
					ex2.initApplicationException(ex);//初始化应用程序异常
					throw ex2;//再次抛出异常
				}
				catch (RuntimeException | Error ex2) {
                    //处理回滚过程中抛出的其他异常 RuntimeException 或Error
					logger.error("Application exception overridden by rollback exception", ex);
					throw ex2;//抛出新的异常
				}
			}
			else {
				// We don't roll back on this exception.
				// Will still roll back if TransactionStatus.isRollbackOnly() is true.
				//如果不需要回滚，尝试提交事务
                //但是如果TransactionStatus被标记了只回滚，则依然会回滚
                try {
					txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
				}
				catch (TransactionSystemException ex2) {
                    //处理提交过程中抛出的异常
					logger.error("Application exception overridden by commit exception", ex);
					ex2.initApplicationException(ex);
					throw ex2;
				}
				catch (RuntimeException | Error ex2) {
                    // 处理提交过程中抛出的其他 RuntimeException 或 Error
					logger.error("Application exception overridden by commit exception", ex);
					throw ex2;
				}
			}
		}
	}
```
**rollback**
> 事务回滚。
> 它确保了在事务回滚时正确的触发前、后处理的方法，并根据事务的具体状态执行适当的回滚操作。
> 具体逻辑如下：
> - 触发方法调用
>    - triggerBeforeCompletion()和triggerAfterCompletion()分别在事务提交前和事务完成后触发。
> - 不同的回滚操作
>    - 根据事务的状态选择回滚到保存点、完全回滚或者让事务发起方决定回滚。
> - 异常处理
>    - 捕获并重新抛出运行时异常或错误，确保事务状态得到正确的处理。
> - 意外回滚处理
>    - 如果事务被标记为仅回滚，根据配置决定是否抛出UnexceptionRollbackException异常。
> - 最终清理
>    - 无论如何都会执行cleanAfterComplete来清理事务状态。

```java
@Override
	public final void rollback(TransactionStatus status) throws TransactionException {
		//如果事务提交了就不能回滚了
        if (status.isCompleted()) {
			throw new IllegalTransactionStateException(
					"Transaction is already completed - do not call commit or rollback more than once per transaction");
		}

		DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
        //执行回滚
		processRollback(defStatus, false);
	}

private void processRollback(DefaultTransactionStatus status, boolean unexpected) {
		try {
            //标记是否发生意外回滚
			boolean unexpectedRollback = unexpected;

			try {
                //触发事务提交前的操作
				triggerBeforeCompletion(status);

                //根据事务状态执行回滚操作
				if (status.hasSavepoint()) {
                    //如果存在保存点，则回滚到保存点
					if (status.isDebug()) {
						logger.debug("Rolling back transaction to savepoint");
					}
					status.rollbackToHeldSavepoint();
				}
				else if (status.isNewTransaction()) {
                    //如果是新事务，则执行完全回滚
					if (status.isDebug()) {
						logger.debug("Initiating transaction rollback");
					}
					doRollback(status);
				}
				else {
					// Participating in larger transaction
                    //参与更大事务中的事务回滚处理
					if (status.hasTransaction()) {
                        //如果事务标记为本地回滚或参与失败全局回滚
						if (status.isLocalRollbackOnly() || isGlobalRollbackOnParticipationFailure()) {
							if (status.isDebug()) {
								logger.debug("Participating transaction failed - marking existing transaction as rollback-only");
							}
							doSetRollbackOnly(status);//将事务标记为仅回滚
						}
						else {
							if (status.isDebug()) {
								logger.debug("Participating transaction failed - letting transaction originator decide on rollback");
							}
						}
					}
					else {
						logger.debug("Should roll back transaction but cannot - no transaction available");
					}
					// Unexpected rollback only matters here if we're asked to fail early
                    //如果不需要在全局回滚时立即失败，则取消意外回滚标记
					if (!isFailEarlyOnGlobalRollbackOnly()) {
						unexpectedRollback = false;
					}
				}
			}
			catch (RuntimeException | Error ex) {
                //捕获并处理任何运行时异常或错误
				triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);
				throw ex;
			}
            //触发事务完成之后的操作
			triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);

			// Raise UnexpectedRollbackException if we had a global rollback-only marker
            //如果标记为意外回滚，则抛出异常
			if (unexpectedRollback) {
				throw new UnexpectedRollbackException(
						"Transaction rolled back because it has been marked as rollback-only");
			}
		}
		finally {
            //清理事务完成后的状态
			cleanupAfterCompletion(status);
		}
	}
```
**doRollBack**
> 用于执行JDBC 事务的回滚操作。

```java
@Override
	protected void doRollback(DefaultTransactionStatus status) {
        //获取事务对象，这里转化成基于数据源的事务
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
		//获取当前事务使用的连接
        Connection con = txObject.getConnectionHolder().getConnection();
        //根据模式选择是否记录日志
		if (status.isDebug()) {
			logger.debug("Rolling back JDBC transaction on Connection [" + con + "]");
		}
		try {
            //执行JDBC连接的回滚操作
			con.rollback();
		}
		catch (SQLException ex) {
			throw new TransactionSystemException("Could not roll back JDBC transaction", ex);
		}
	}
```
**commitAfterReturning**
> 常用于在目标方法成功执行完成后的提交事务。这个方法能够确保在业务逻辑正确完成后数据库变更被持久化。
> 具体执行逻辑如下：
> - 获取事务状态
>    - 获取当前事务状态，准备提交操作。
> - 提交事务
>    - 提交事务，将所有变更持久化到数据库。
> - 日志记录
>    - 如果调试模式开启，记录提交事务的日志信息。
> - 异常处理
>    - 捕获并处理DataAccessException异常，如果提交的过程中发生任何问题，记录错误日志，并重新抛出异常。

```java
protected void commitTransactionAfterReturning(@Nullable TransactionInfo txInfo) {
    if (txInfo != null && txInfo.getTransactionStatus() != null) {
        if (logger.isTraceEnabled()) {
            logger.trace("Completing transaction for [" + txInfo.getJoinpointIdentification() + "]");
        }
        txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
    }
}

@Override
public final void commit(TransactionStatus status) throws TransactionException {
    //事务已经提交不能再次提交
    if (status.isCompleted()) {
        throw new IllegalTransactionStateException(
                "Transaction is already completed - do not call commit or rollback more than once per transaction");
    }

    DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
    //如果事务设置了回滚标记则直接回滚
    if (defStatus.isLocalRollbackOnly()) {
        if (defStatus.isDebug()) {
            logger.debug("Transactional code has requested rollback");
        }
        processRollback(defStatus, false);
        return;
    }

    if (!shouldCommitOnGlobalRollbackOnly() && defStatus.isGlobalRollbackOnly()) {
        if (defStatus.isDebug()) {
            logger.debug("Global transaction is marked as rollback-only but transactional code requested commit");
        }
        processRollback(defStatus, true);
        return;
    }
    //提交事务
    processCommit(defStatus);
}

private void processCommit(DefaultTransactionStatus status) throws TransactionException {
    try {
        boolean beforeCompletionInvoked = false;

        try {
            boolean unexpectedRollback = false;
            //准备 提交前的处理阶段
            prepareForCommit(status);
            
            //触发事务提交前的回调方法
            triggerBeforeCommit(status);

            //触发事务即将完成的回调方法
            triggerBeforeCompletion(status);
            beforeCompletionInvoked = true;

            //根据事务不同的状态进行不同的提交处理
            if (status.hasSavepoint()) {
                //存在保存点，释放保存点
                if (status.isDebug()) {
                    logger.debug("Releasing transaction savepoint");
                }
                unexpectedRollback = status.isGlobalRollbackOnly();
                status.releaseHeldSavepoint();
            }
            else if (status.isNewTransaction()) {
                //新事务，记录是否回滚，直接提交
                if (status.isDebug()) {
                    logger.debug("Initiating transaction commit");
                }
                unexpectedRollback = status.isGlobalRollbackOnly();
                doCommit(status);
            }
            else if (isFailEarlyOnGlobalRollbackOnly()) {
                // 全局标记为回滚，根据配置执行相应处理
                unexpectedRollback = status.isGlobalRollbackOnly();
            }

            // Throw UnexpectedRollbackException if we have a global rollback-only
            // marker but still didn't get a corresponding exception from commit.
            if (unexpectedRollback) {
                throw new UnexpectedRollbackException(
                        "Transaction silently rolled back because it has been marked as rollback-only");
            }
        }
        catch (UnexpectedRollbackException ex) {
            // can only be caused by doCommit
            triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);
            throw ex;
        }
        catch (TransactionException ex) {
            // can only be caused by doCommit
            if (isRollbackOnCommitFailure()) {
                doRollbackOnCommitException(status, ex);
            }
            else {
                triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);
            }
            throw ex;
        }
        catch (RuntimeException | Error ex) {
            if (!beforeCompletionInvoked) {
                triggerBeforeCompletion(status);
            }
            doRollbackOnCommitException(status, ex);
            throw ex;
        }

        // Trigger afterCommit callbacks, with an exception thrown there
        // propagated to callers but the transaction still considered as committed.
        try {
            //触发事务提交后的回调方法，在此方法中的异常会被传播给调用者，但事务仍被认为是以提交状态
            triggerAfterCommit(status);
        }
        finally {
            //最终完成事务后的回调，进行清理工作
            triggerAfterCompletion(status, TransactionSynchronization.STATUS_COMMITTED);
        }

    }
    finally {
        //完成事务处理之后的清理工作
        cleanupAfterCompletion(status);
    }
}
```
> 方法执行流程解析：
> - prepareForCommit：
>    - 进入事务提交前的处理，执行准备工作。包括资源准备和一些事务状态的检查工作。
> - triggerBeforeCommit
>    - 触发事务提交前注册的回调方法，这些方法允许应用程序在事务提交前执行必要的逻辑，如数据预处理，或准备工作。
> - triggerBeforeCompletion
>    - 在事务即将完成时触发注册的回调。这个阶段标志着事务要进入最后的提交阶段。
> - 根据事务状态进行不同的提交处理
>    - 存在保存点status.hasPoint
>       - 如果存在保存点，则释放保存点，并检查全局回滚标志，决定是否要回滚事务。
>       - **保存点**
>          - **保存点通常用于在事务执行的过程中的某一时刻创建一个快照，以便后续操作中能回滚到这个快照状态。**
>          - **存在保存点的事务允许部分提交，可以选择性的提交部分事务，而其他回滚。**
>    - 新事物status.isNewTrasaction
>       - 如果当前事务是新事务，即不存在保存点，检查是否回滚，执行提交操作。
>       - **不存在保存点**
>          - **不存在保存点，说明事务在执行的过程中没有创建快照，事务只能作为一个整体要么回滚要么提交。**
>    - 全局标记为回滚
>       - 如果配置要求在全局回滚是立即失败，则根据配置决定后续处理。
> - 异常处理
>    - UnexceptionRollbackException
>       - 如果在提交的过程中遇到这个异常，表示事务在不应回滚的情况下发生了意外回滚，此时会触发事务完成后的回调，并抛出异常。
>    - TransactionExceptio
>       - 处理这个异常的时候根据配置决定是否回滚，或触发事务完成后的回调。
>    - RuntimeException | Error
>       - 如果在事务完成前发生 RuntimeException 或 Error 异常，会在必要时触发事务即将完成的回调方法，并进行事务的回滚处理。
> - 事务提交后的回调
>    - triggerAfterCommit方法， 在事务提交成功后，触发注册的事务提交后的回调方法，这些回调方法允许应用程序执行与事务提交成功相关的逻辑。
> - 事务完成后的清理
>    - cleanupAfterCompletion方法， 执行事务完成后的清理工作。包括清理事务状态、释放资源或者其他事务执行相关的清理操作。


> - triggerAfterCommit
>    - 仅当事务成功提交(即没有发生回滚)才会调用次方法。
>    - 主要用途
>       - 通知监听器：通知那些关注事务提交成功的监听器，这些监听器可能会进行后续的处理，比如发布事件、更新缓存等。
>       - 业务逻辑执行：执行一些需要事务提交成功之后才能进行的业务逻辑，例如发送确认邮件、记录日志等。
>    - 场景
>       - 电商系统中，订单事务提交成功后，使用triggerAfterCommit方法发送订单确定邮件给用户。
>       - 银行系统中，转账事务提交成功后，通知相关系统更新账户余额。
> - cleanupAfterCompletion
>    - 事务完成之后的清理工作
>    - 主要用途：
>       - 释放事务过程中占用的相关资源，如数据库连接、锁等。
>       - 状态重置：重置或清理事务相关的状态信息，以准备下一次事务操作。
>       - 清理线程绑定：解除线程上绑定的事务信息， 避免线程重用时出现问题。
>    - 场景
>       - 基于数据库应用中这个方法会确保关闭数据库连接，并释放相关资源。
>       - 在分布式系统中，当事务完成之后，会解除对分布式事务上下文的绑定，防止后续影响

### 3、总结
##### 接口总结：

- @EnableTransactionManagement
   - 启动注解驱动事务管理功能
- @Transactional
   - 通过这个注解定义在，某个类或者某个方法上，开启事务。
- @TransactionEventListener
   - 事务事件监听器
- TransactionDefinition
   - 接口，事务定义，允许开发者指定事务的行为。
   - 包括隔离级别、传播行为、超时设置、只读等
- TransactionStatus
   - 接口，事务状态；用于查询和控制当前的事务状态，进行事务的提交、回滚等处理。
- PlatformTransactionManager
   - 接口，事务管理；
   - 核心方法：
      - getTransaction
         - 开始一个新的事务，获取当前线程绑定的事务，如果存在的话
      - commit
         - 提交事务，如果被标记了只回滚，则抛出异常，导致事务回滚。
      - rollback
         - 回滚事务。
- ProxyTransactionManagementConfiguration
   - 代理配置类。配置和启用Spring事务管理功能，使用代理来拦截方法调用并应用事务逻辑
- BeanFactoryTransactionAttributeSourceAdvisor
   - PointCutAdvisor的实现，作用是根据事务属性为匹配的切点应用事务增强。
   - 通过TransactionAttributeSource的来实现**切点定义**,以确定哪些方法需要应用事务。
   - 通过TransactionInterceptor来**增强定义**逻辑，包括事务管理器、事务属性解析器等，从而实现在匹配的切点上应用事务管理逻辑。
- TransactionInterceptor
   - MethodInterceptor的实现，拦截器，作用是给被拦截的方法添加事务管理功能。
- TransactionAttributeSource
   - 接口，通过getTransactionAttribute获取TransactionAttribute
   - TransactionAttribute继承自TransactionDefinition。


##### 流程总结：
1、通过EnableTransactionManagement注解驱动整个Spring事务模块。
2、通过Transactional注解，标记在某个类或者方法上，定义事务传播类型，开启注解
3、通过ProxyTransactionMannagementConfiguration代理配置类来定义一个BeanFactoryTransactionAttributeSourceAdvisor切面，是一个用于Spring配置的AOP切面。
4、通过AOP切入点和切面（PointcutAdvisor关联的Pointcut内部有一个TransactionAttributeSource对象），利用TransactionAttributeSource确定方法的事务属性，再通过TransactionAnnotationParser解析@Transactional 注解，最终将解析的事务属性封装成TransactionDenifition事务定义对象。
5、Spring AOP 拦截处理在TransactionInterceptor中，先借助PlantformTransactionMannager平台事务管理器创建一个TransactionStatus事务状态对象，并将数据库连接自动提交autoCommit设置为false，TransactionStatus里面包含一个Transaction事务对象，方法执行完所有数据库操作都在一个对象里面。
6、spring事务依赖线程局部变量和事务同步管理器，通过者两者共同确保了事务操作的正确性和一致性。通过ThreadLocal存储DataSource、Connection和SqlSession等事务相关的局部变量。
通常讲，单体项目的事务都在一个线程中完成。
事务同步管理器，负责协调并管理事务相关的资源，包括事务状态、连接、会话等。
多个资源同步：一个事务中可能设计多个数据源、多个数据库连接或多个数据库会话。TransactionSynchronizationMannager确保它们的状态能够正确地同步和管理。

