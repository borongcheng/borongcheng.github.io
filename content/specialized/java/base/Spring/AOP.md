+++
date = "2024-08-28T11:52:54"
title = "AOP切面"
tags = ["JAVA","Spring"]
+++
# 一、切面
> [https://www.cnblogs.com/lifullmoon/p/14654795.html](https://www.cnblogs.com/lifullmoon/p/14654795.html)

1、什么是AOP？
> AspectJ：Aspect-oriented programming is a way of modularizing crosscutting concerns much like object-oriented programming is a way of modularizing common concerns.
> Spring：Aspect-oriented Programming (AOP) complements Object-oriented Programming (OOP) by providing another way of thinking about program structure. The key unit of modularity in OOP is the class, whereas in AOP the unit of modularity is the aspect. Aspects enable the modularization of concerns (such as transaction management) that cut across multiple types and objects. (Such concerns are often termed “crosscutting” concerns in AOP literature.)

AOP面向切面编程，是一种开发理念，是对OOP面向对象的补充。
在OOP中最小的单元是一个对象，但是在AOP中最小的单元是切面。
一个切面可以包含很多种类型和对象，对它们进行模块化管理，例如事务管理。
2、为什么引入AOP？
AOP是对OOP的补充，因为OOP存在一些局限性；

- 静态化的语言：类结构一旦被定义就不容易被修改
- 侵入性的扩展：通过继承或者组合组织新的类结构

通过AOP，我们可以将非业务代码从业务代码中抽取出来，以非入侵的方式与原方法进行协同。
这样可以更关注于业务代码，解耦合，代码逻辑更清晰，便于维护。

3、常见的使用场景

- 日志场景
   - 诊断上下文，如log4j或logback
   - 辅助信息，方法的执行时间
- 统计场景
   - 方法调用次数
   - 执行异常次数
   - 数据抽样
   - 数据累加
- 安防场景
   - 熔断，例如Neflix Hystrix
   - 限流和降级，例如 Sentinel
   - 认证和授权，例如 Spring Security
   - 监控,例如JMX
- 性能场景
   - 缓存，例如Spring Cache
   - 超时控制

4、AOP几个重要的概念

- AspectJ
   - 切面，是一个概念，没有具体的接口或者类与之对应，是Join point，Advance和Pointcut的一个统称
- Join point
   - 连接点，应用程序执行的过程可以被拦截的点，支持方法级别的连接点。
- Advice
   - 通知，即我们定义的一个切面中的横切逻辑，有around、after、before三种。
- Point cut
   - 切入点，用于匹配连接点，它定义了哪里应用切面的逻辑，通常Point cut 通过表达式来定义
- introduction
   - 引入，允许向现有对象添加新的属性和方法，而不需要改动代码
- Weaving
   - 织入，在切点引导下，将切面逻辑织入到目标方法上，使得我们的通知逻辑在方法使用的中被调用
- Aop proxy
   - AOP代理，是指在AOP框架中实现切面协议的对象，通常有两种实现方式，一种是JDK动态代理，一种是CGLIB动态代理。
- Traget Object
   - 目标对象，及被代理的对象

5、通常有哪几种AOP框架？
主流的AOP框架

- AspectJ：完整的AOP框架
- Spring AOP：非完整的AOP实现框架

Spring AOP 是基于 JDK 动态代理和 Cglib 提升实现的，两种代理方式都属于运行时的一个方式，所以它没有编译时的一个处理，那么因此 Spring 是通过 Java 代码实现的。AspectJ 自己有一个编译器，在编译时期可以修改 .class 文件，在运行时也会进行处理。

Spring AOP 有别于其他大多数 AOP 实现框架，目的不是提供最完整的 AOP 实现（尽管 Spring AOP 相当强大）；相反，其目的是在 AOP 实现和 Spring IoC 之间提供紧密的集成，以提供企业级核心特性。

Spring AOP 从未打算与 AspectJ 竞争以提供全面的 AOP 解决方案，我们认为 Spring AOP 等基于代理实现的框架和 AspectJ 等成熟的框架都是有价值的，并且它们是互补的，而不是竞争关系。Spring 将 Spring AOP 和 IoC 与 AspectJ 无缝集成，以实现 AOP 的所有功能都可以在一个 Spring 应用中。这种集成不会影响 Spring AOP API 或 AOP Alliance API，保持向后兼容。

# 二、解读
通常使用切面我们需要经过以下一个流程

- 开启注解@EnableAspectJAutoProxy
- 创建切点
   - 在切点类上加@Aspect注解
   - before
   - after
   - around
- 编写切面
   - 对ProceedingJointPoint 类型的代理对象进行切面逻辑编写

### @EnableAspectJAutoProxy
> 这个注解主要是开启AspetJ代理的支持：
> - Spring会自动为@Aspect注解的类进行代理
> - 支持基于AspectJ注解的切面，Aspect注解提供了before、after、around等多种切面形式。
> - 可以使用基于AspectJ表达式来定义切点
> - 使用这个注解，启用的代理是在运行时创建的，因此它支持动态的为目标对象代理，并在方法执行时织入切面逻辑，在不改变原始代码的情况下实现横切点关注的功能增强。

```java

@Import(AspectJAutoProxyRegistrar.class)
public @interface EnableAspectJAutoProxy {
    //proxyTargetClass属性，默认false，尝试采用JDK动态代理织入增强(如果当前类没有实现接口则还是会使用CGLIB)；如果设为true，则强制采用CGLIB动态代理织入增强
    boolean proxyTargetClass() default false;
    //通过aop框架暴露该代理对象，aopContext能够访问。为了解决类内部方法之间调用时无法增强的问题
    boolean exposeProxy() default false;
}
```
> 三个重点
> - @Import(AspectJAutoProxyRegistrar.class) 该注解的作用是向spring容器注册一个AspectJAutoProxyRegistrar类。通过这个类去注册一个AnnotationAwareAspectJAutoProxyCreator。
> - proxyTargetClass属性
>    - 指定是否使用CGLIB代理，如果为true强制使用CGLIB
>    - 如果为false，如果目标类实现了接口，则使用JDK动态代理，如果目标类没有实现接口则用CGLIB代理，因为JDK动态代理是依托于接口实现的，代理类实现目标类的接口，并在方法调用时织入切面。
> - exposeProxy属性
>    - 指定是否将代理类暴露给当前线程
>    - true，则可以通过aopContext.currentProxy()去获取，false则无法获取
>    - 场景：在目标方法中需要获取当前代理类时。
> 
     综上所述该注解的作用是在spring容器中能够启动AspectJ注解驱动的AOP功能。

#### AspectJAutoProxyRegistrar
> - 注册AspectJAutoProxyCreator
>    - AspectJAutoProxyRegistrar内部会注册一个ApsectJAutoProxyCreator，用于创建代理对象，在代理对象中织入横切逻辑
> - 激活AspectJ注解驱动的AOP功能
>    - 通过注册AspectJAutoProxyCreator，Spring能够识别带有@Aspect 的注解切面类，从而启动AspectJ注解驱动的AOP功能。
> - 支持AspectJ注解
>    - 通过这个注册的过程，spring程序可以正确的识别AspectJ相关的切面注解，例如@Aspect,@Before,@After

```java
class AspectJAutoProxyRegistrar implements ImportBeanDefinitionRegistrar {
    AspectJAutoProxyRegistrar() {
    }

    @Override
public void registerBeanDefinitions(
    AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
    
    // 注册 AspectJ 注解自动代理创建器，如果需要的话
    AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);

    // 获取 @EnableAspectJAutoProxy 注解的属性信息
    AnnotationAttributes enableAspectJAutoProxy =
        AnnotationConfigUtils.attributesFor(importingClassMetadata, EnableAspectJAutoProxy.class);
    
    // 判断 @EnableAspectJAutoProxy 注解是否存在
    if (enableAspectJAutoProxy != null) {
        // 如果 proxyTargetClass 属性为 true，则强制自动代理创建器使用类代理
        if (enableAspectJAutoProxy.getBoolean("proxyTargetClass")) {
            AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
        }
        // 如果 exposeProxy 属性为 true，则强制自动代理创建器暴露代理对象给当前线程
        if (enableAspectJAutoProxy.getBoolean("exposeProxy")) {
            AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);
        }
    }
}
}
```
**registerAspectJAnnotationAutoProxyCreatorIfNecessary**
> 主要作用是注册或升级AspectJ注解自动代理创建器（AnnotationAwareAspectJAutoProxyCreator）。

```java
@Nullable
private static BeanDefinition registerOrEscalateApcAsRequired(Class<?> cls, BeanDefinitionRegistry registry,
        @Nullable Object source) {

    // 确保 BeanDefinitionRegistry 不为空
    Assert.notNull(registry, "BeanDefinitionRegistry must not be null");

    // 检查是否已经存在自动代理创建器的 BeanDefinition
    if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
        // 如果已存在自动代理创建器的定义，则检查其是否与指定类匹配
        BeanDefinition apcDefinition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
        if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
            // 如果存在自动代理创建器，但其类与指定类不匹配，则根据优先级决定是否升级自动代理创建器
            int currentPriority = findPriorityForClass(apcDefinition.getBeanClassName());
            int requiredPriority = findPriorityForClass(cls);
            if (currentPriority < requiredPriority) {
                // 如果指定类的优先级高于当前自动代理创建器的类，则更新自动代理创建器的类
                apcDefinition.setBeanClassName(cls.getName());
            }
        }
        return null; // 返回 null 表示无需注册新的 BeanDefinition
    }

    // 如果不存在自动代理创建器的定义，则创建新的自动代理创建器 BeanDefinition
    RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
    beanDefinition.setSource(source);
    beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
    beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
    // 注册自动代理创建器的 BeanDefinition
    registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
    return beanDefinition; // 返回新注册的 BeanDefinition
}
```
#### AnnotationAwareAspectJAutoProxyCreator
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1717752811495-8f6bd39f-961a-4ae4-a3e4-ce5447949716.png#averageHue=%232d2d2c&clientId=ue54401c9-d249-4&from=paste&height=1075&id=ued57d667&originHeight=1209&originWidth=1950&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=200196&status=done&style=none&taskId=u169b145a-6eef-4588-bb4b-754d44b7cb0&title=&width=1733.3333333333333)
> 由类的继承图我们可知，这个类间接实现了BeanPostProcessor；
> 之前在看spring容器初始化的时候知道bean在初始化前后会调用postProcessorBeforeInstantiation和postProcessorAfterInstantiation,而AOP的整体逻辑就是通过这两个方法来实现的。
> InstantiationAwareBeanPostProcessor 接口的方法之一：
> - postProcessorBeforeInstantiation
>    - 作用：在实例化Bean之前，允许对Bean进行自定义处理
>    - 触发时机：在bean的实例化之前被调用，即在createBeanInstance方法执行之前。
>    - 返回值：返回的对象将成为bean的实际实例，可以是原始对象，也可以是替代的对象。
>    - AOP场景：
>       - Spring AOP的实现依赖于拦截器链，这些拦截器会在bean方法调用之前、之后、或者替代其执行。
>       - postProcessorBeforeInstantiation方法用于检查当前bean是否需要代理，如果需要就返回一个合适的代理对象。
>       - Spring AOP框架会在这个方法中调用自定义的逻辑来判断当前bean是否匹配某些切面的条件，如果匹配则创建。
>       - 通过返回的代理对象，可以在代理对象中织入切面的增强逻辑，以拦截方法调用并执行额外的处理，如事务管理、安全检查、日志记录等。
> - postProcessorAfterInstantiation
>    - 作用：对bean进行进一步的属性设置和初始化操作。
>    - 触发：在实例化bean之后，属性注入之前
>    - 返回值：返回一个boolean值，表示是否能够继续进行初始化工作
>    - AOP场景：
>       - 用于bean在实例化之后进行检查和调整。检查代理对象是否正确创建，并确保代理具有所需的属性和状态。
>       - 不用于创建代理，用于进一步检查配置。

##### postProcessorBeforeInstantiation
> 这个方法不在AnnotationAwareAspectJAutoProxyCreator中，在其父类AbstractAutoProxyCreator里面
> 主要作用是在Bean的实例化之前，判断是否要对当前bean进行增强并创建代理对象
> - 接收一个beanDefinition对象，检查是否存在该bean匹配的Advisor切面。
>    - 在通过shouldSkip方法检查是否需要跳过基础设施时，会通过里面的findCandidateAdvisors去创建advisors。
> - 遍历这些Advisor，检查切入点表达式是否满足条件。
> - 切入点匹配成功，则对目标bean进行增强
>    - 这里会调用createProxy()方法创建一个代理对象，该代理对象负责在目标Bean的方法执行时执行切面逻辑
> - 代理对象创建之前会检查目标bean是否已经被处理过，避免重复处理
>    - postProcessorBeforeInstantation方法会检查当前bean是否已经被处理过
>    - 如果被处理过直接返回原始bean的实例
> - 如果未被处理，则创建代理对象并将其设置为新的bean实例

```java
public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) throws BeansException {
    // 获取缓存Key
    Object cacheKey = getCacheKey(beanClass, beanName);

    // 如果beanName为空或者不在目标源Bean列表中，继续执行
    if (!StringUtils.hasLength(beanName) || !this.targetSourcedBeans.contains(beanName)) {
      // 如果该Bean已经被增强过，则返回null
      if (this.advisedBeans.containsKey(cacheKey)) {
        return null;
      }
            
      // 如果当前Bean类是基础设施类或者应该跳过，则将其标记为已增强并返回null
      if (isInfrastructureClass(beanClass) || shouldSkip(beanClass, beanName)) {
        this.advisedBeans.put(cacheKey, Boolean.FALSE);
        return null;
      }
    }

    // 尝试获取自定义的目标源（TargetSource）
    TargetSource targetSource = getCustomTargetSource(beanClass, beanName);
    if (targetSource != null) {
      // 如果beanName不为空，则将其添加到目标源Bean列表中
      if (StringUtils.hasLength(beanName)) {
        this.targetSourcedBeans.add(beanName);
      }
      // 获取特定的拦截器和增强对象数组
      Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(beanClass, beanName, targetSource);
      // 创建代理对象
      Object proxy = createProxy(beanClass, beanName, specificInterceptors, targetSource);
      // 将代理对象的类型信息存储到代理类型映射表中
      this.proxyTypes.put(cacheKey, proxy.getClass());
      return proxy;
    }

    return null; // 返回null表示不需要对Bean进行增强
}

```
**shouldSkip**
> 用于判断给定的bean类和bean名称是否应该被跳过增强，具体来说它用于判断是否应该跳过对特定bean的AOP增强处理。
> 在应用AOP时，有些类不需要进行增强处理，例如一些基础设置类，或已经进行过增强的类。

```java
@Override
	protected boolean shouldSkip(Class<?> beanClass, String beanName) {
		// TODO: Consider optimization by caching the list of the aspect names
        //获取所有标识了Aspect注解的类
		List<Advisor> candidateAdvisors = findCandidateAdvisors();
		for (Advisor advisor : candidateAdvisors) {
			if (advisor instanceof AspectJPointcutAdvisor) {
				if (((AbstractAspectJAdvice) advisor.getAdvice()).getAspectName().equals(beanName)) {
					return true;
				}
			}
		}
		return super.shouldSkip(beanClass, beanName);
	}
//进入findCandidateAdvisors类
    protected List<Advisor> findCandidateAdvisors() {
        return this.advisorRetrievalHelper.findAdvisorBeans();
    }
    
    protected List<Advisor> findCandidateAdvisors() {
        List<Advisor> advisors = super.findCandidateAdvisors();
        //buildAspectJAdvisors是重点
           advisors.addAll(this.aspectJAdvisorsBuilder.buildAspectJAdvisors());
        return advisors;
    }
```
**buildAspectJAdvisors**
> 作用是用于构建AspectJ的Advisor(通知者)列表,Advisor是AOP中的核心概念之一，它包含了逻辑增强的切点信息，用于在目标方法执行的时候进行拦截处理。

```java
public List<Advisor> buildAspectJAdvisors() {
    // 获取当前已缓存的 Aspect Bean 名称列表
    List<String> aspectNames = this.aspectBeanNames;

    if (aspectNames == null) {  // 如果 aspectNames 为 null，表示还没有进行过初始化
        synchronized (this) {  // 加锁，确保线程安全
            aspectNames = this.aspectBeanNames;
            if (aspectNames == null) {  // 再次检查（双重检查锁定），防止重复初始化
                List<Advisor> advisors = new LinkedList<>();  // 用于存储找到的 Advisors
                aspectNames = new LinkedList<>();  // 用于存储 Aspect Bean 的名称
                // 获取所有类型为 Object 的 bean 名称，包括祖先 BeanFactory 中的
                String[] beanNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
                        this.beanFactory, Object.class, true, false);
                for (String beanName : beanNames) {  // 遍历所有 Bean
                    if (!isEligibleBean(beanName)) {  // 检查 Bean 是否符合条件
                        continue;  // 如果不符合条件，跳过这个 Bean
                    }
                    // 获取 Bean 的类型，但不触发实例化
                    Class<?> beanType = this.beanFactory.getType(beanName);
                    if (beanType == null) {  // 如果无法获取 Bean 类型，跳过
                        continue;
                    }
                    // 检查是否是一个 Aspect（即切面）
                    if (this.advisorFactory.isAspect(beanType)) {
                        aspectNames.add(beanName);  // 将 Aspect Bean 名称添加到列表中
                        // 创建 AspectMetadata，用于描述 Aspect 的元数据
                        AspectMetadata amd = new AspectMetadata(beanType, beanName);
                        if (amd.getAjType().getPerClause().getKind() == PerClauseKind.SINGLETON) {
                            // 如果是单例模式的 Aspect
                            MetadataAwareAspectInstanceFactory factory =
                                    new BeanFactoryAspectInstanceFactory(this.beanFactory, beanName);
                            List<Advisor> classAdvisors = this.advisorFactory.getAdvisors(factory);
                            if (this.beanFactory.isSingleton(beanName)) {
                                this.advisorsCache.put(beanName, classAdvisors);  // 缓存单例模式的 Advisors
                            } else {
                                this.aspectFactoryCache.put(beanName, factory);  // 缓存非单例模式的工厂
                            }
                            advisors.addAll(classAdvisors);  // 添加到返回的 Advisors 列表中
                        } else {
                            // 如果是 per target 或 per this 模式的 Aspect
                            if (this.beanFactory.isSingleton(beanName)) {
                                throw new IllegalArgumentException("Bean with name '" + beanName +
                                        "' is a singleton, but aspect instantiation model is not singleton");
                            }
                            MetadataAwareAspectInstanceFactory factory =
                                    new PrototypeAspectInstanceFactory(this.beanFactory, beanName);
                            this.aspectFactoryCache.put(beanName, factory);  // 缓存工厂
                            advisors.addAll(this.advisorFactory.getAdvisors(factory));  // 添加 Advisors
                        }
                    }
                }
                this.aspectBeanNames = aspectNames;  // 更新缓存的 Aspect Bean 名称列表
                return advisors;  // 返回找到的 Advisors 列表
            }
        }
    }

    if (aspectNames.isEmpty()) {  // 如果没有找到任何 Aspect
        return Collections.emptyList();  // 返回空列表
    }
    List<Advisor> advisors = new LinkedList<>();  // 用于存储最终的 Advisors 列表
    for (String aspectName : aspectNames) {  // 遍历所有找到的 Aspect Bean 名称
        List<Advisor> cachedAdvisors = this.advisorsCache.get(aspectName);  // 从缓存中获取 Advisors
        if (cachedAdvisors != null) {  // 如果缓存中有
            advisors.addAll(cachedAdvisors);  // 添加到返回的 Advisors 列表中
        } else {
            MetadataAwareAspectInstanceFactory factory = this.aspectFactoryCache.get(aspectName);
            advisors.addAll(this.advisorFactory.getAdvisors(factory));  // 从工厂中获取 Advisors 并添加
        }
    }
    return advisors;  // 返回最终的 Advisors 列表
}

```
> 方法流程：
> - 获取当前缓存的AspectBean列表，如果AspectName为null，则加锁进行初始化
>    - 获取所有类型为Object类型的bean
>    - 遍历bean，进行检查，通过的bean去获取bean的类型beanType，但是不进行初始化。
>    - 存在beanType，并检查beanType是否是Aspect
>    - 区分AspectBean是单例的还是不是单例的
>       - 单例：采用单例的增强方式(PerClauseKind.SINGLETON)，则创建相应的AspectInstanceFactory(切面实例工厂)，并将其与Advisor缓存起来。
>       - 非单例：使用原型的增强方式，直接创建AspectInstanceFactory，并获取对应的Advisors。
>    - 将符合条件的Advisor添加到advisor列表之中并返回。

**advisorFactory.getAdvisors**
> 作用是从@Aspect 标识的类上获取@Before，@Pointcut等注解的信息及其标识的方法的信息，生成增强 
> 简单来说advisorFactory.getAdvisors就是将Aspect的增强方法转换成一系列的Advisor对象，以便SpringAOP框架能够将这些正确的增强逻辑织入到目标对象中。	

```java
public List<Advisor> getAdvisors(MetadataAwareAspectInstanceFactory aspectInstanceFactory) {
    // 获取 Aspect 类和名称
    Class<?> aspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
    String aspectName = aspectInstanceFactory.getAspectMetadata().getAspectName();

    // 验证 Aspect 类的合法性
    validate(aspectClass);

    // 创建一个装饰器，确保 aspectInstanceFactory 只会被实例化一次
    MetadataAwareAspectInstanceFactory lazySingletonAspectInstanceFactory =
            new LazySingletonAspectInstanceFactoryDecorator(aspectInstanceFactory);

    // 用于存储生成的 Advisor 对象
    List<Advisor> advisors = new LinkedList<>();

    // 遍历 Aspect 类中所有被标记为 Advisor 方法
    for (Method method : getAdvisorMethods(aspectClass)) {
        // 获取并创建 Advisor 对象，并添加到 advisors 列表中
        Advisor advisor = getAdvisor(method, lazySingletonAspectInstanceFactory, advisors.size(), aspectName);
        if (advisor != null) {
            advisors.add(advisor);
        }
    }

    // 如果这是一个每个目标对象都需要独立实例化的 Aspect，则需要添加一个虚拟的实例化 Advisor
    if (!advisors.isEmpty() && lazySingletonAspectInstanceFactory.getAspectMetadata().isLazilyInstantiated()) {
        Advisor instantiationAdvisor = new SyntheticInstantiationAdvisor(lazySingletonAspectInstanceFactory);
        advisors.add(0, instantiationAdvisor);
    }

    // 查找并处理引入的字段
    for (Field field : aspectClass.getDeclaredFields()) {
        Advisor advisor = getDeclareParentsAdvisor(field);
        if (advisor != null) {
            advisors.add(advisor);
        }
    }

    // 返回生成的 Advisor 列表
    return advisors;
}

//获取类的的方法
private List<Method> getAdvisorMethods(Class<?> aspectClass) {
    final List<Method> methods = new LinkedList<Method>();
    ReflectionUtils.doWithMethods(aspectClass, new ReflectionUtils.MethodCallback() {
        @Override
        public void doWith(Method method) throws IllegalArgumentException {
                //在@Aspect标识的类内部排除@Pointcut标识之外的所有方法，得到的方法集合包括继承自父类的方法，包括继承自Object的方法
            if (AnnotationUtils.getAnnotation(method, Pointcut.class) == null) {
                methods.add(method);
            }
        }
    });
    //对得到的所有方法排序，
    //如果方法标识了切面注解，则按@Around, @Before, @After, @AfterReturning, @AfterThrowing的顺序排序
    //如果没有标识这些注解，则按方法名称的字符串排序,
    //有注解的方法排在无注解的方法之前
    //最后的排序应该是这样的Around.class, Before.class, After.class, AfterReturning.class, AfterThrowing.class。。。
    Collections.sort(methods, METHOD_COMPARATOR);
    return methods;
}

//逻辑简化伪代码
public List<Advisor> getAdvisors(MetadataAwareAspectInstanceFactory factory) {
    List<Advisor> advisors = new ArrayList<>();

    // 获取 Aspect 类
    Class<?> aspectClass = factory.getAspectClass();

    // 解析 Aspect 类中的增强方法
    for (Method method : aspectClass.getDeclaredMethods()) {
        if (isBeforeAdvice(method)) {
            // 创建 Before 增强
            BeforeAdvice beforeAdvice = createBeforeAdvice(method, factory);
            // 创建切入点
            Pointcut pointcut = createPointcut(method);
            // 创建 Advisor
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, beforeAdvice);
            advisors.add(advisor);
        } else if (isAfterAdvice(method)) {
            // 创建 After 增强
            AfterAdvice afterAdvice = createAfterAdvice(method, factory);
            // 创建切入点
            Pointcut pointcut = createPointcut(method);
            // 创建 Advisor
            Advisor advisor = new DefaultPointcutAdvisor(pointcut, afterAdvice);
            advisors.add(advisor);
        }
        // 类似地处理其他类型的增强（Around, AfterReturning, AfterThrowing等）
    }

    return advisors;
}
```
**getAdvisor**
> 作用是，基于提供的注解方法(如 @Before, @After, @Around 等注解的方法)创建一个Advisor类，这个Advisor对象包含了切面逻辑(增强)，以及相应的切入点（定义在Joint Point上的应用增强）

```java

public Advisor getAdvisor(Method candidateAdviceMethod, MetadataAwareAspectInstanceFactory aspectInstanceFactory,
        int declarationOrderInAspect, String aspectName) {
    //再次校验类的合法性
    validate(aspectInstanceFactory.getAspectMetadata().getAspectClass());
    //切点表达式的包装类里面包含这些东西：execution(public * cn.shiyujun.service.IOCService.hollo(..))
    AspectJExpressionPointcut expressionPointcut = getPointcut(
            candidateAdviceMethod, aspectInstanceFactory.getAspectMetadata().getAspectClass());
    if (expressionPointcut == null) {
        return null;
    }
    //根据方法、切点、AOP实例工厂、类名、序号生成切面实例，详细代码往下看
    return new InstantiationModelAwarePointcutAdvisorImpl(expressionPointcut, candidateAdviceMethod,
            this, aspectInstanceFactory, declarationOrderInAspect, aspectName);
}
```
```java
private AspectJExpressionPointcut getPointcut(Method candidateAdviceMethod, Class<?> candidateAspectClass) {
    //查询方法上的切面注解，根据注解生成相应类型的AspectJAnnotation,在调用AspectJAnnotation的构造函数的同时
    //根据注解value或pointcut属性得到切点表达式，有argNames则设置参数名称
    AspectJAnnotation<?> aspectJAnnotation =
            AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(candidateAdviceMethod);
    //过滤那些不含@Before, @Around, @After, @AfterReturning, @AfterThrowing注解的方法
    if (aspectJAnnotation == null) {
        return null;
    }
    //生成带表达式的切面切入点，设置其切入点表达式
    AspectJExpressionPointcut ajexp =
            new AspectJExpressionPointcut(candidateAspectClass, new String[0], new Class<?>[0]);
    ajexp.setExpression(aspectJAnnotation.getPointcutExpression());
    ajexp.setBeanFactory(this.beanFactory);
    return ajexp;
}
```
```java

public InstantiationModelAwarePointcutAdvisorImpl(AspectJExpressionPointcut declaredPointcut,
      Method aspectJAdviceMethod, AspectJAdvisorFactory aspectJAdvisorFactory,
      MetadataAwareAspectInstanceFactory aspectInstanceFactory, int declarationOrder, String aspectName) {

    this.declaredPointcut = declaredPointcut;
    this.declaringClass = aspectJAdviceMethod.getDeclaringClass();
    this.methodName = aspectJAdviceMethod.getName();
    this.parameterTypes = aspectJAdviceMethod.getParameterTypes();
    this.aspectJAdviceMethod = aspectJAdviceMethod;
    this.aspectJAdvisorFactory = aspectJAdvisorFactory;
    this.aspectInstanceFactory = aspectInstanceFactory;
    this.declarationOrder = declarationOrder;
    this.aspectName = aspectName;

    if (aspectInstanceFactory.getAspectMetadata().isLazilyInstantiated()) {
      Pointcut preInstantiationPointcut = Pointcuts.union(
          aspectInstanceFactory.getAspectMetadata().getPerClausePointcut(), this.declaredPointcut);

      this.pointcut = new PerTargetInstantiationModelPointcut(
          this.declaredPointcut, preInstantiationPointcut, aspectInstanceFactory);
      this.lazy = true;
    }
    else {
      this.pointcut = this.declaredPointcut;
      this.lazy = false;
            //重点在这里
      this.instantiatedAdvice = instantiateAdvice(this.declaredPointcut);
    }
  }
//进入instantiateAdvice方法
private Advice instantiateAdvice(AspectJExpressionPointcut pointcut) {
    //再往下看
    Advice advice = this.aspectJAdvisorFactory.getAdvice(this.aspectJAdviceMethod, pointcut,
        this.aspectInstanceFactory, this.declarationOrder, this.aspectName);
    return (advice != null ? advice : EMPTY_ADVICE);
  }
```
```java
public Advice getAdvice(Method candidateAdviceMethod, AspectJExpressionPointcut expressionPointcut,
                        MetadataAwareAspectInstanceFactory aspectInstanceFactory, int declarationOrder, String aspectName) {

    // 获取候选方法所属的AspectJ切面类
    Class<?> candidateAspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
    // 验证候选类是否为有效的AspectJ切面类
    validate(candidateAspectClass);

    // 查找候选方法上的AspectJ注解
    AspectJAnnotation<?> aspectJAnnotation =
            AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(candidateAdviceMethod);
    if (aspectJAnnotation == null) {
        return null;
    }

    // 确认候选方法所在的类是一个AspectJ切面类
    if (!isAspect(candidateAspectClass)) {
        throw new AopConfigException("Advice must be declared inside an aspect type: " +
                "Offending method '" + candidateAdviceMethod + "' in class [" +
                candidateAspectClass.getName() + "]");
    }

    // 如果日志级别为DEBUG，则记录找到的AspectJ方法
    if (logger.isDebugEnabled()) {
        logger.debug("Found AspectJ method: " + candidateAdviceMethod);
    }

    AbstractAspectJAdvice springAdvice;

    // 根据注解类型创建相应的Advice实例
    switch (aspectJAnnotation.getAnnotationType()) {
        case AtBefore:
            springAdvice = new AspectJMethodBeforeAdvice(
                    candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
            break;
        case AtAfter:
            springAdvice = new AspectJAfterAdvice(
                    candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
            break;
        case AtAfterReturning:
            springAdvice = new AspectJAfterReturningAdvice(
                    candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
            AfterReturning afterReturningAnnotation = (AfterReturning) aspectJAnnotation.getAnnotation();
            if (StringUtils.hasText(afterReturningAnnotation.returning())) {
                springAdvice.setReturningName(afterReturningAnnotation.returning());
            }
            break;
        case AtAfterThrowing:
            springAdvice = new AspectJAfterThrowingAdvice(
                    candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
            AfterThrowing afterThrowingAnnotation = (AfterThrowing) aspectJAnnotation.getAnnotation();
            if (StringUtils.hasText(afterThrowingAnnotation.throwing())) {
                springAdvice.setThrowingName(afterThrowingAnnotation.throwing());
            }
            break;
        case AtAround:
            springAdvice = new AspectJAroundAdvice(
                    candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
            break;
        case AtPointcut:
            if (logger.isDebugEnabled()) {
                logger.debug("Processing pointcut '" + candidateAdviceMethod.getName() + "'");
            }
            return null;
        default:
            throw new UnsupportedOperationException(
                    "Unsupported advice type on method: " + candidateAdviceMethod);
    }

   //设置通知方法所属的类
    springAdvice.setAspectName(aspectName);
    //设置通知的序号,同一个类中有多个切面注解标识的方法时,按上方说的排序规则来排序，
    //其序号就是此方法在列表中的序号，第一个就是0
    springAdvice.setDeclarationOrder(declarationOrder);
    //获取通知方法的所有参数
    String[] argNames = this.parameterNameDiscoverer.getParameterNames(candidateAdviceMethod);
    //将通知方法上的参数设置到通知中
    if (argNames != null) {
        springAdvice.setArgumentNamesFromStringArray(argNames);
    }
    //计算参数绑定工作，此方法详解请接着往下看
    springAdvice.calculateArgumentBindings();
    return springAdvice;
}
```
**springAdvice.calculateArgumentBindings**
> 在springAOP中，Advice通常会定义一些参数，这些参数可以在切入点执行的时候传入给Advice.
> 但是在运行时，spring需要知道要如何将切点的参数值与Advice方法的参数进行匹配和绑定。

```java
//参数绑定实例
public class MyService {
    public void performTask(String taskName, int duration) {
        System.out.println("Performing task: " + taskName + " for " + duration + " minutes.");
    }
}


import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class LoggingAspect {

    @Before("execution(* MyService.performTask(..)) && args(taskName, duration)")
    public void beforePerformTask(String taskName, int duration) {
        System.out.println("About to execute task: " + taskName + " with duration: " + duration);
    }
}



public void calculateArgumentBindings() {
    // 这里是一个示例实现，展示了如何计算参数绑定。
    // 实际代码会根据具体的参数名称和位置进行复杂的计算。
    String[] parameterNames = {"taskName", "duration"};
    for (String paramName : parameterNames) {
        // 假设我们有一个方法来获取参数的位置
        int index = getParameterIndex(paramName);
        argumentBindings.put(paramName, index);
    }
}
```
```java

public synchronized final void calculateArgumentBindings() {
    if (this.argumentsIntrospected || this.parameterTypes.length == 0) {
        return;
    }

    int numUnboundArgs = this.parameterTypes.length;
    Class<?>[] parameterTypes = this.aspectJAdviceMethod.getParameterTypes();
    //切面注解标识的方法第一个参数要求是JoinPoint,或StaticPart，若是@Around注解则也可以是ProceedingJoinPoint
    if (maybeBindJoinPoint(parameterTypes[0]) || maybeBindProceedingJoinPoint(parameterTypes[0])) {
        numUnboundArgs--;
    }
    else if (maybeBindJoinPointStaticPart(parameterTypes[0])) {
        numUnboundArgs--;
    }

    if (numUnboundArgs > 0) {
    //绑定属性
        bindArgumentsByName(numUnboundArgs);
    }

    this.argumentsIntrospected = true;
}
private void bindArgumentsByName(int numArgumentsExpectingToBind) {
    if (this.argumentNames == null) { //获取方法参数的名称
        this.argumentNames = createParameterNameDiscoverer().getParameterNames(this.aspectJAdviceMethod);
    }
    if (this.argumentNames != null) {
        // 往下看
        bindExplicitArguments(numArgumentsExpectingToBind);
    }
    else {
        throw new IllegalStateException("Advice method [" + this.aspectJAdviceMethod.getName() + "] " +
                "requires " + numArgumentsExpectingToBind + " arguments to be bound by name, but " +
                "the argument names were not specified and could not be discovered.");
    }
}

private void bindExplicitArguments(int numArgumentsLeftToBind) {
    //此属性用来存储方法未绑定的参数名称，及参数的序号
    this.argumentBindings = new HashMap<String, Integer>();

    int numExpectedArgumentNames = this.aspectJAdviceMethod.getParameterTypes().length;
    if (this.argumentNames.length != numExpectedArgumentNames) {
        throw new IllegalStateException("Expecting to find " + numExpectedArgumentNames +
                " arguments to bind by name in advice, but actually found " +
                this.argumentNames.length + " arguments.");
    }

    // So we match in number...,argumentIndexOffset代表第一个未绑定参数的顺序 
    int argumentIndexOffset = this.parameterTypes.length - numArgumentsLeftToBind;
    for (int i = argumentIndexOffset; i < this.argumentNames.length; i++) {
        //存储未绑定的参数名称及其顺序的映射关系
        this.argumentBindings.put(this.argumentNames[i], i);
    }

    // Check that returning and throwing were in the argument names list if
    // specified, and find the discovered argument types.
    //如果是@AfterReturning注解的returningName 有值，验证，解析，同时得到定义返回值的类型
    if (this.returningName != null) {
        if (!this.argumentBindings.containsKey(this.returningName)) {
            throw new IllegalStateException("Returning argument name '" + this.returningName +
                    "' was not bound in advice arguments");
        }
        else {
            Integer index = this.argumentBindings.get(this.returningName);
            this.discoveredReturningType = this.aspectJAdviceMethod.getParameterTypes()[index];
            this.discoveredReturningGenericType = this.aspectJAdviceMethod.getGenericParameterTypes()[index];
        }
    }
    //如果是@AfterThrowing注解的throwingName 有值，验证，解析，同时得到抛出异常的类型
    if (this.throwingName != null) {
        if (!this.argumentBindings.containsKey(this.throwingName)) {
            throw new IllegalStateException("Throwing argument name '" + this.throwingName +
                    "' was not bound in advice arguments");
        }
        else {
            Integer index = this.argumentBindings.get(this.throwingName);
            this.discoveredThrowingType = this.aspectJAdviceMethod.getParameterTypes()[index];
        }
    }

    // configure the pointcut expression accordingly.
    configurePointcutParameters(argumentIndexOffset);
}

private void configurePointcutParameters(int argumentIndexOffset) {
    int numParametersToRemove = argumentIndexOffset;
    if (this.returningName != null) {
        numParametersToRemove++;
    }
    if (this.throwingName != null) {
        numParametersToRemove++;
    }
    String[] pointcutParameterNames = new String[this.argumentNames.length - numParametersToRemove];
    Class<?>[] pointcutParameterTypes = new Class<?>[pointcutParameterNames.length];
    Class<?>[] methodParameterTypes = this.aspectJAdviceMethod.getParameterTypes();

    int index = 0;
    for (int i = 0; i < this.argumentNames.length; i++) {
        if (i < argumentIndexOffset) {
            continue;
        }
        if (this.argumentNames[i].equals(this.returningName) ||
            this.argumentNames[i].equals(this.throwingName)) {
            continue;
        }
        pointcutParameterNames[index] = this.argumentNames[i];
        pointcutParameterTypes[index] = methodParameterTypes[i];
        index++;
    }
    //剩余的未绑定的参数会赋值给AspectJExpressionPointcut(表达式形式的切入点)的属性，以备后续使用
    this.pointcut.setParameterNames(pointcutParameterNames);
    this.pointcut.setParameterTypes(pointcutParameterTypes);
}
```
##### postProcessorAfterInstantiation
> 这个方法是在AbstarctAutoProxyCreator中，是在bean实例化之后属性注入之前调用的，它适用所有需要被代理的类。

```java
public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
    if (bean != null) {
        Object cacheKey = getCacheKey(bean.getClass(), beanName);
        if (!this.earlyProxyReferences.contains(cacheKey)) {
        //往下看
            return wrapIfNecessary(bean, beanName, cacheKey);
        }
    }
    return bean;
}

protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
    // 1. 跳过某些指定的 bean 名称
    if (beanName == null || shouldSkip(beanName)) {
        return bean;
    }

    // 2. 检查该 bean 是否已经被处理过
    if (this.targetSourcedBeans.contains(beanName)) {
        return bean;
    }

    // 3. 检查该 bean 是否已经被标记为不需要代理
    if (Boolean.FALSE.equals(this.advisedBeans.get(beanName))) {
        return bean;
    }

    // 4. 如果该 bean 是基础设施类或者应该跳过，直接返回原始 bean
    if (isInfrastructureClass(bean.getClass()) || shouldSkip(bean.getClass(), beanName)) {
        this.advisedBeans.put(beanName, Boolean.FALSE);
        return bean;
    }

    // 5. 获取适用于该 bean 的 advices 和 advisors
    Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
    if (specificInterceptors != DO_NOT_PROXY) {
        this.advisedBeans.put(beanName, Boolean.TRUE);
        // 6. 创建代理对象
        return createProxy(bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
    }

    // 7. 如果不需要代理，标记该 bean 不需要代理并返回原始 bean
    this.advisedBeans.put(beanName, Boolean.FALSE);
    return bean;
}
```
> 核心方法：
> - shouldSkip
>    - 决定是否跳过某个特定的bean名称。这通常用于排除某些不需要代理的特殊bean。
> - isInfrastructureClass
>    - 判断给定的类是否是基础设施类，基础设施类通常不需要代理，例如Advice，Advisors这些支持AOP的类。
> - getAdvicesAndAdvisorsForBean
>    - 获取适用于当前bean的advice和advisors。这一步决定了bean是否需要代理，如果需要代理则要返回具体的拦截器数组。
> - createProxy
>    - 创建代理对象，这个方法会根据给定的拦截器和目标源创建一个适当的代理器，通常是jdk动态代理或者CGLIB代理。
> - SingletonTargetSource
>    - 用于封装目标Bean，使得代理对象能够在每次调用指向同一目标实例。

**getAdviceAndAdvisorsForBean**
> 获取类的增强；
> 查找适用于特定bean的Advisor。

```java

protected Object[] getAdvicesAndAdvisorsForBean(Class<?> beanClass, String beanName, TargetSource targetSource) {
//往下看
    List<Advisor> advisors = findEligibleAdvisors(beanClass, beanName);
    if (advisors.isEmpty()) {
        return DO_NOT_PROXY;
    }
    return advisors.toArray();
}

protected List<Advisor> findEligibleAdvisors(Class<?> beanClass, String beanName) {
    //获取容器中的所有切面
    List<Advisor> candidateAdvisors = findCandidateAdvisors();
    //验证beanClass是否该被代理，如果应该，则返回适用于这个bean的增强
    List<Advisor> eligibleAdvisors = findAdvisorsThatCanApply(candidateAdvisors, beanClass, beanName);
    extendAdvisors(eligibleAdvisors);
    if (!eligibleAdvisors.isEmpty()) {
        eligibleAdvisors = sortAdvisors(eligibleAdvisors);
    }
    return eligibleAdvisors;
}
```
> - findCandidateAdvisors
>    - 获取spring容器里面的所有Advisor
> - findAdvisorsThatCanApply
>    - 获取符合这个beanClass的Advisors
> - extendAdvisors
>    - 对筛选出来的增强列表进一步扩展和进一步处理。
>    - 允许子类或者框架添加额外的增强
> - sortAdvisors
>    - 排序增强， 基于优先级的逻辑对这些增强进行排序

**findCandidateAdvisors**
> 获取容器里面的所有Advisor

```java
protected List<Advisor> findCandidateAdvisors() {
    // 调用父类的方法加载配置文件中的AOP声明（注解与XML都存在的时候）
    List<Advisor> advisors = super.findCandidateAdvisors();
        //往下看
        if (this.aspectJAdvisorsBuilder != null) {
      advisors.addAll(this.aspectJAdvisorsBuilder.buildAspectJAdvisors());
    }
    return advisors;
  }
```
**buildAspectJAdvisors**
> 从spring容器中寻找被@Aspect注解标记的类，将其转换成可以应用于目标对象的Advisor列表

```java
public List<Advisor> buildAspectJAdvisors() {
    List<String> aspectNames = this.aspectBeanNames;

    if (aspectNames == null) {
      synchronized (this) {
        aspectNames = this.aspectBeanNames;
        if (aspectNames == null) {
          List<Advisor> advisors = new LinkedList<>();
          aspectNames = new LinkedList<>();
                    //获取所有的bean
          String[] beanNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
              this.beanFactory, Object.class, true, false);
          for (String beanName : beanNames) {
                      //校验不合法的类，Spring的一个扩展点，可以从子类中做排除切面的操作
            if (!isEligibleBean(beanName)) {
              continue;
            }
            //获取bean的类型
            Class<?> beanType = this.beanFactory.getType(beanName);
            if (beanType == null) {
              continue;
            }
                        //是否带有Aspect注解
            if (this.advisorFactory.isAspect(beanType)) {
              aspectNames.add(beanName);
              AspectMetadata amd = new AspectMetadata(beanType, beanName);
              if (amd.getAjType().getPerClause().getKind() == PerClauseKind.SINGLETON) {
                MetadataAwareAspectInstanceFactory factory =
                    new BeanFactoryAspectInstanceFactory(this.beanFactory, beanName);
                                        //解析所有的增强方法，下面说
                List<Advisor> classAdvisors = this.advisorFactory.getAdvisors(factory);
                if (this.beanFactory.isSingleton(beanName)) {
                  this.advisorsCache.put(beanName, classAdvisors);
                }
                else {
                  this.aspectFactoryCache.put(beanName, factory);
                }
                advisors.addAll(classAdvisors);
              }
              else {
                if (this.beanFactory.isSingleton(beanName)) {
                  throw new IllegalArgumentException("Bean with name '" + beanName +
                      "' is a singleton, but aspect instantiation model is not singleton");
                }
                MetadataAwareAspectInstanceFactory factory =
                    new PrototypeAspectInstanceFactory(this.beanFactory, beanName);
                this.aspectFactoryCache.put(beanName, factory);
                advisors.addAll(this.advisorFactory.getAdvisors(factory));
              }
            }
          }
          this.aspectBeanNames = aspectNames;
          return advisors;
        }
      }
    }

    if (aspectNames.isEmpty()) {
      return Collections.emptyList();
    }
    List<Advisor> advisors = new LinkedList<>();
    for (String aspectName : aspectNames) {
      List<Advisor> cachedAdvisors = this.advisorsCache.get(aspectName);
      if (cachedAdvisors != null) {
        advisors.addAll(cachedAdvisors);
      }
      else {
        MetadataAwareAspectInstanceFactory factory = this.aspectFactoryCache.get(aspectName);
        advisors.addAll(this.advisorFactory.getAdvisors(factory));
      }
    }
    return advisors;
  }
```
> 接着的是获取advisors方法this.advisorFactory.getAdvisors();
> 该方法调用流程同postProcessorBeforeInstantiation解析中的。

**findAdvisorsThatCanApply**
> 遍历所有的adivsor，并通过matcher来判断哪些Advisor的切入点PointCut与当前方法匹配。
> 如果匹配成功，这些Advisor就会被返回，并最终用于创建代理对象时的增强逻辑。
> 通常会通过advisor转换成相应的拦截器，并应用到最终方法上。

```java

protected List<Advisor> findAdvisorsThatCanApply(
      List<Advisor> candidateAdvisors, Class<?> beanClass, String beanName) {

    ProxyCreationContext.setCurrentProxiedBeanName(beanName);
    try {
        //往下看
      return AopUtils.findAdvisorsThatCanApply(candidateAdvisors, beanClass);
    }
    finally {
      ProxyCreationContext.setCurrentProxiedBeanName(null);
    }
  }

public static List<Advisor> findAdvisorsThatCanApply(List<Advisor> candidateAdvisors, Class<?> clazz) {
    if (candidateAdvisors.isEmpty()) {
        return candidateAdvisors; // 如果候选 Advisor 列表为空，直接返回空列表
    }

    List<Advisor> eligibleAdvisors = new LinkedList<Advisor>(); // 创建一个用于存放符合条件的 Advisor 的列表

    for (Advisor candidate : candidateAdvisors) {
        // 处理引介增强
        if (candidate instanceof IntroductionAdvisor && canApply(candidate, clazz)) {
            eligibleAdvisors.add(candidate); // 如果是引介增强并且可以应用于该类，则加入到符合条件的 Advisor 列表中
        }
    }

    boolean hasIntroductions = !eligibleAdvisors.isEmpty(); // 标记是否有引介增强适用于该类

    for (Advisor candidate : candidateAdvisors) {
        if (candidate instanceof IntroductionAdvisor) {
            continue; // 如果是引介增强，跳过后续处理
        }
        // 对普通 bean 的处理
        if (canApply(candidate, clazz, hasIntroductions)) {
            eligibleAdvisors.add(candidate); // 如果可以应用于该类，则加入到符合条件的 Advisor 列表中
        }
    }

    return eligibleAdvisors; // 返回符合条件的 Advisor 列表
}

```
> - 遍历Advisor，优先处理引介增强，将适用于该类的引介增强加入到符合条件的Advisor列表中。
>    - 引介增强：是springAOP中的一种强大功能，允许在运行时动态地为对象添加新的接口和方法实现。
>    - 原理：通过拦截器链和动态代理的机制，在调用方法的时候拦截并进行增强处理。
> - 标记是否有引介增强适用于该类
> - 再次遍历advisor，如果普通bean可以适用该类则添加到列表中。

```java
//引介增强和普通bean都是进入这个方法进行判定，引进增强第三个参数默认false
public static boolean canApply(Advisor advisor, Class<?> targetClass, boolean hasIntroductions) {
    //如果存在排除的配置
    if (advisor instanceof IntroductionAdvisor) {
        return ((IntroductionAdvisor) advisor).getClassFilter().matches(targetClass);
    }
    else if (advisor instanceof PointcutAdvisor) {
        PointcutAdvisor pca = (PointcutAdvisor) advisor;
        //往下看
        return canApply(pca.getPointcut(), targetClass, hasIntroductions);
    }
    else {
        return true;
    }
}

public static boolean canApply(Pointcut pc, Class<?> targetClass, boolean hasIntroductions) {
    // 检查切点是否为空，如果为空则抛出异常
    Assert.notNull(pc, "Pointcut must not be null");

    // 检查切点上的类过滤器是否匹配目标类，如果不匹配则返回 false
    if (!pc.getClassFilter().matches(targetClass)) {
        return false;
    }

    // 获取切点的方法匹配器
    MethodMatcher methodMatcher = pc.getMethodMatcher();

    // 如果方法匹配器的结果为真，即代表所有方法都匹配，则返回 true
    if (methodMatcher == MethodMatcher.TRUE) {
        return true;
    }

    // 定义一个引入感知的方法匹配器对象
    IntroductionAwareMethodMatcher introductionAwareMethodMatcher = null;

    // 如果方法匹配器是引入感知的，将其赋值给 introductionAwareMethodMatcher 对象
    if (methodMatcher instanceof IntroductionAwareMethodMatcher) {
        introductionAwareMethodMatcher = (IntroductionAwareMethodMatcher) methodMatcher;
    }

    // 创建一个类集合，其中包含目标类实现的所有接口和目标类本身
    Set<Class<?>> classes = new LinkedHashSet<Class<?>>(ClassUtils.getAllInterfacesForClassAsSet(targetClass));
    classes.add(targetClass);

    // 遍历所有的类和接口，然后遍历每个类和接口中声明的方法
    for (Class<?> clazz : classes) {
        for (Method method : ReflectionUtils.getAllDeclaredMethods(clazz)) {
            // 对每个方法进行匹配，如果引入感知的方法匹配器存在且匹配成功，或者普通方法匹配器匹配成功，则返回 true
            if ((introductionAwareMethodMatcher != null &&
                    introductionAwareMethodMatcher.matches(method, targetClass, hasIntroductions)) ||
                    methodMatcher.matches(method, targetClass)) {
                return true;
            }
        }
    }

    // 如果以上条件都不满足，则最终返回 false
    return false;
}

```
**createProxy**
> 创建代理对象

```java
protected Object createProxy(Class<?> beanClass, @Nullable String beanName,
		@Nullable Object[] specificInterceptors, TargetSource targetSource) {

    // 如果 beanFactory 是 ConfigurableListableBeanFactory 的实例，
    // 则调用 AutoProxyUtils.exposeTargetClass 方法将目标类暴露出来
    if (this.beanFactory instanceof ConfigurableListableBeanFactory) {
        AutoProxyUtils.exposeTargetClass((ConfigurableListableBeanFactory) this.beanFactory, beanName, beanClass);
    }

    // 创建一个 ProxyFactory 对象
    ProxyFactory proxyFactory = new ProxyFactory();
    // 从当前 AdvisedSupport 对象中复制配置到 ProxyFactory 对象中
    proxyFactory.copyFrom(this);

    // 如果不指定是否代理目标类，默认根据条件决定是否代理目标类
    if (!proxyFactory.isProxyTargetClass()) {
        // 根据条件判断是否应该代理目标类
        if (shouldProxyTargetClass(beanClass, beanName)) {
            proxyFactory.setProxyTargetClass(true); // 设置代理目标类
        } else {
            // 根据目标类获取接口并设置到 ProxyFactory 中
            evaluateProxyInterfaces(beanClass, proxyFactory);
        }
    }

    // 构建 Advisor 数组
    Advisor[] advisors = buildAdvisors(beanName, specificInterceptors);
    // 将 Advisor 数组添加到 ProxyFactory 中
    proxyFactory.addAdvisors(advisors);
    // 设置 TargetSource
    proxyFactory.setTargetSource(targetSource);
    // 自定义 ProxyFactory
    customizeProxyFactory(proxyFactory);

    // 设置是否冻结代理对象
    proxyFactory.setFrozen(this.freezeProxy);
    // 如果 Advisor 已经预筛选，则设置为预筛选模式
    if (advisorsPreFiltered()) {
        proxyFactory.setPreFiltered(true);
    }

    // 返回代理对象
    return proxyFactory.getProxy(getProxyClassLoader());
}

```
**getProxy**
> 获取代理对象

```java
public Object getProxy(@Nullable ClassLoader classLoader) {
    return createAopProxy().getProxy(classLoader);
  }
protected final synchronized AopProxy createAopProxy() {
    if (!this.active) {
      activate();
    }
    return getAopProxyFactory().createAopProxy(this);
  }

public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
    // 检查是否需要优化、是否强制代理目标类或者没有用户提供的代理接口
    if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
        // 获取目标类
        Class<?> targetClass = config.getTargetClass();
        
        // 如果目标类为空，抛出异常，说明无法确定目标类
        if (targetClass == null) {
            throw new AopConfigException("TargetSource cannot determine target class: " +
                "Either an interface or a target is required for proxy creation.");
        }
        
        // 如果目标类是接口或是一个代理类（JDK动态代理生成的类）
        if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
            // 使用 JDK 动态代理
            return new JdkDynamicAopProxy(config);
        }

        // 否则，使用 CGLIB 代理
        return new ObjenesisCglibAopProxy(config);
    } else {
        // 默认情况下使用 JDK 动态代理
        return new JdkDynamicAopProxy(config);
    }
}
```
**invoke**
> 代理调用，增强的使用

```java
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    MethodInvocation invocation;
    Object oldProxy = null;
    boolean setProxyContext = false;

    TargetSource targetSource = this.advised.targetSource;
    Object target = null;

    try {
        // 处理equals方法
        if (!this.equalsDefined && AopUtils.isEqualsMethod(method)) {
            return equals(args[0]);
        }
        // 处理hashCode方法
        else if (!this.hashCodeDefined && AopUtils.isHashCodeMethod(method)) {
            return hashCode();
        }
        else if (method.getDeclaringClass() == DecoratingProxy.class) {
            return AopProxyUtils.ultimateTargetClass(this.advised);
        }
        else if (!this.advised.opaque && method.getDeclaringClass().isInterface() &&
                 method.getDeclaringClass().isAssignableFrom(Advised.class)) {
            // 在代理配置上调用服务
            return AopUtils.invokeJoinpointUsingReflection(this.advised, method, args);
        }

        Object retVal;
        // 如果设置了暴露代理对象
        if (this.advised.exposeProxy) {
            oldProxy = AopContext.setCurrentProxy(proxy);
            setProxyContext = true;
        }

        target = targetSource.getTarget();
        Class<?> targetClass = (target != null ? target.getClass() : null);

        // 获取当前方法的拦截器链
        List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);

        if (chain.isEmpty()) {
            // 如果没有拦截器，直接调用切点方法
            Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
            retVal = AopUtils.invokeJoinpointUsingReflection(target, method, argsToUse);
        }
        else {
            invocation = new ReflectiveMethodInvocation(proxy, target, method, args, targetClass, chain);
            // 执行拦截器链
            retVal = invocation.proceed();
        }

        Class<?> returnType = method.getReturnType();
        // 处理返回结果
        if (retVal != null && retVal == target &&
            returnType != Object.class && returnType.isInstance(proxy) &&
            !RawTargetAccess.class.isAssignableFrom(method.getDeclaringClass())) {
            retVal = proxy;
        }
        else if (retVal == null && returnType != Void.TYPE && returnType.isPrimitive()) {
            throw new AopInvocationException(
                "Null return value from advice does not match primitive return type for: " + method);
        }
        return retVal;
    }
    finally {
        if (target != null && !targetSource.isStatic()) {
            targetSource.releaseTarget(target);
        }
        if (setProxyContext) {
            AopContext.setCurrentProxy(oldProxy);
        }
    }
}

```
**invocation.proceed**
> 拦截器的调用链

```java
public Object proceed() throws Throwable {
    //  执行完所有的增强后执行切点方法
    if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
      return invokeJoinpoint();
    }
        //获取下一个要执行的拦截器
    Object interceptorOrInterceptionAdvice =
        this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
    if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
      InterceptorAndDynamicMethodMatcher dm =
          (InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
      if (dm.methodMatcher.matches(this.method, this.targetClass, this.arguments)) {
        return dm.interceptor.invoke(this);
      }
      else {
        // Dynamic matching failed.
        // Skip this interceptor and invoke the next in the chain.
        return proceed();
      }
    }
    else {
      // It's an interceptor, so we just invoke it: The pointcut will have
      // been evaluated statically before this object was constructed.
      return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
    }
  }
```
# 三、面试题
### spring aop源码全流程概述。
spring aop的工作流程主要分成：配置解析，代理创建，切入点和通知管理、动态代理生成、以及方法拦截执行。

- 配置解析
   - XML配置解析
      - 通过XML标签配置AOP相关元素
```java
<aop:config>
    <aop:ponitcut id="myPointcut" expression="excution(* com.example..*(..))"/>
    <aop:advisor advice-ref="myAdvice" pointcut-ref="myPointcut"/>
</aop:config>
```

   - @EnableAspectJAuto注解
      - 通过这个注解去开启AspectJ AOP支持
      - 这个注解会import一个AspectJAutoProxyRegister类，通过这个类去间接注册一个annotationAwareAspectJAutoProxyCreator自动代理对象。
      - 这个代理对象实现了几种BeanPostProcessor接口，会在bean的实例化前后调用，解析出所有的Advisors，返回代理类。
- 代理创建
   - annotationAwareAspectJAutoProxyCreator有一个抽象父类实现了BeanPostProcessor的两个方法，postProcessorBeforeInstantiation方法和postProcessorAfterInstantiation方法。
   - postProcessorBeforeInstantiation
      - bean实例化前进行的处理，判断是否需要为bean创建代理对象
      - 如果这步返回了代理对象，那么后续将不会在实例化bean
   - postProcessorAfterInstantiation：
      - bean实例化之后属性注入之前调用。
      - 检查是否需要给当前bean创建代理，创建代理需要以下工作
         - 确定创建代理bean的类型
         - 收集该类的Advisor（通知器列表），Adivsor包含的切面信息，例如切点Advice
         - 使用JDK动态代理或者CGLIB的方式创建代理对象。JDK动态代理要求目标最少实现一个接口，而CGLIB则没有这种要求。
- 切入点和通知管理
   - AOP通过Advisor来管理切入点和通知点。Pointcut定义了哪些连接点上应用通知，而advice则定义了具体的执行逻辑。
      - Pointcut：基于表达式的切入点，如AspectJ表达式。
      - Advisor：将Pointcut和Advice结合起来，并管理它们的应用。
- 动态代理生成
   - 根据目标bean的具体配置，spring会选择jdk或者CGLIB生成代理对象。
      - JDK：用于实现了接口的bean，通过反射的形式生成代理对象
      - CGLIB：用于没有实现接口的bean，通过enhancer生成其子类来实现代理。
- 方法执行拦截
   - 当代理对象的方法被调用时，调用会被拦截器拦截，并依次执行通知逻辑，每个advice都是MethodInterceptor类型的。
   - ReflectiveMethodInvocation类封装了方法调用的上下文，负责依次调用每一个拦截器或目标方法。
> 综述：
> - 配置解析
>    - spring在扫描XML文件或者@EnableApsectJAutoProxy注解，注册必要的bean定义
> - 代理创建
>    - bean在初始化的时候，通过AbstractAutoProxyCreator判断哪些bean需要被代理，并创建代理对象。
> - 切入点和通知管理
>    - 通过Advisor管理切入点和通知，将它们应用到对应的bean上面
> - 动态代理生成
>    - 根据bean的类型和具体配置，选择使用jdk或者cglib去生成动态代理对象。
> - 方法执行拦截
>    - 代理对象的方法执行被拦截，依次执行配置的通知逻辑，并最终调用目标方法。

### spring aop 用到哪些设计模式

- 创建型模式
   - 抽象工厂模式
   - 工厂方法模式
   - 构建器模式
   - 单例模式
   - 原型模式
- 结构型模式
   - 适配器模式
   - 组合模式
   - 装饰器模式
   - 享元模式
   - 代理模式
- 行为型模式
   - 模板方法模式
   - 责任链模式
   - 观察者模式
   - 策略模式
   - 命令模式
   - 状态模式

### spring aop在spring框架内部有哪些应用

- spring事件
- spring事务
- spring数据
- spring缓存抽象
- spring本地调度
- spring整合
- spring远程调用
