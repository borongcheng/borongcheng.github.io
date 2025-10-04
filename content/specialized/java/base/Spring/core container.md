+++
date = "2024-08-28T11:52:54"
title = "IOC容器"
tags = ["JAVA","Spring"]
categories = ["专业"]
+++
![](https://cdn.nlark.com/yuque/0/2024/jpeg/22648511/1717058156371-3bb877f1-7ba4-4dd1-b4e6-5db726391432.jpeg#averageHue=%23f8f8f8&clientId=ua02b68fb-45ae-4&from=paste&id=uacea561c&originHeight=376&originWidth=640&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=ua1ee9aaf-28ba-4f5e-bf6f-e1a5884c342&title=)
#  一、container 容器
### （1）、容器简介
1、什么是容器？
顾名思义，容器时存放物体的，在spring中容器是存放元数据的，也就是bean的实例。
容器仅仅是存放bean的吗？不是，容器不光是存放bean，还可以管理bean的整个生命周期。
容器管理着bean的创建与销毁，还有bean与bean之间的关系。
2、容器的实现
容器的实现类不唯一，spring提供了两种实现体系，一种是早期的beanFactory类的实现，另一种是applicationContext的实现体系。
applicationContext是继承自beanFacotry类，对原有功能进行拓展。
这两个体系的不同之处在于：

- 初始化时机不同
   - beanFactory启用了懒加载的形式初始化bean。
   - applicationContext则是刚开始启动就初始化所有的bean，并使他们在整个程序的生命周期中都保持活跃
   - 实时初始化bean和懒加载初始化bean的优缺点
      - 实时化初始化bean：启动时更耗费资源，时间更长，占用内存更多；但是请求响应速度更快
      - 懒加载初始化bean：启动更快，占用内存更少，但是请求的时候需要动态初始化bean，响应时间更长
- 功能特性不同
   - applicationContext支持更多的功能特性，例如Aop，国际化支持，事件发布等。
- 性能
   - applicationContext由于在启动阶段初始化了所有bean，所以会更耗性能。
- 资源管理
   - beanFactory更侧重于IOC容器的功能
   - applicationContext除了关注IOC容器之外，还提供了对消息、事件、资源、环境、AOP等的全面支持
### （2）、构造关系
![](https://cdn.nlark.com/yuque/0/2024/webp/22648511/1717063802428-46b14e2a-dfa1-475a-82d8-1960796cffe1.webp#averageHue=%23303a37&clientId=ub3417bc9-f404-4&from=paste&id=DZG8o&originHeight=491&originWidth=873&originalType=url&ratio=1.25&rotation=0&showTitle=false&status=done&style=none&taskId=u7a0d7aa0-78fe-46ba-bdb5-5452c4db3d2&title=)
隐去一些不必要的部分，只看applicationContext的两个实现类，ClassPathXmlApplicationContext、FileSystemXmlApplicationContext；

- ClassPathXmlApplicationContext
   - 通过类的路径去加载XML配置文件来初始化Spring的应用上下文
   - 当你的XML配置文件在resources资源目录之下，项目是以jar或者war的形式打包通常会以这种形式去加载文件
- FileSystemXmlApplicationContext
   - 从文件系统路径去加载XML配置文件来初始Spring的应用上下文
   - 当你的XML配置文件位于文件系统的某个文件夹下（例如/opt/myapp/config/applicationContext.xml）
   - 比较适合在开发的过程中进行快速测试，或者在某些特定的部署场景下，配置文件不是打包在Jar或者War文件中的情况下

额外补充，还可以通过AnnotationConfigApplicatonContext的形式去初始化容器:

- AnnotationConfigApplicatonContext
   - 基于注解的形式去加载java中的Bean，定义并初始化Spring容器。
   - 它是通过扫描注解@Configuration来加载应用程序上下文的。

### 1、ClassPathXmlApplicationContext
**ClassPathXmlApplicationContext**类构造
继承图
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1717146796095-ddb37b9d-0f2b-41b9-859d-25c3bf6561ff.png#averageHue=%232d2d2d&clientId=u355b0432-21aa-4&from=paste&height=745&id=u3bcae0bb&originHeight=931&originWidth=1084&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=111005&status=done&style=none&taskId=u20ab04bb-423e-4c8f-ba34-e21d39ab098&title=&width=867.2)
```java
public class ClassPathXmlApplicationContext extends AbstractXmlApplicationContext {
    //配置文件数组
    @Nullable
	private Resource[] configResources;
    ......
   // 指定ApplicationContext的父容器
  public ClassPathXmlApplicationContext(ApplicationContext parent) {
    super(parent);
  }
    .......
  public ClassPathXmlApplicationContext(
			String[] configLocations, boolean refresh, @Nullable ApplicationContext parent)
			throws BeansException {

		super(parent);
                //根据类的配置文件路径，组成配置文件数组
		setConfigLocations(configLocations);
		if (refresh) {
			refresh();
		}
	}
}
```
> 1、setConfigLocation()解析配置文件路径即初始化环境变量
> 2、refresh()

#### setConfigLocation
> 作用有两个：
> 1、[创建ConfigurableEnvironment变量](#N6UuS)
> 2、[处理ClassPathXmlApplicationContext传入的XML文件路径字符出的占位符](#n8Rhl)
> 

```java
public void setConfigLocations(@Nullable String... locations) {
		if (locations != null) {
			Assert.noNullElements(locations, "Config locations must not be null");
			this.configLocations = new String[locations.length];
			for (int i = 0; i < locations.length; i++) {
                //处理占位符并创建ConfigurableEnvironment变量
				this.configLocations[i] = resolvePath(locations[i]).trim();
			}
		}
		else {
			this.configLocations = null;
		}
	}

protected String resolvePath(String path) {
//创建环境变量
//处理占位符
    return getEnironment().resolveRequiredPlaceholders(path);
}

public ConfigurableEnvironment getEnvironment() {
    if (this.environment == null) {
        //创建环境变量相关操作 
        this.environment = createEnvironment();
    }

    
    return this.environment;
}
```
##### ConfigurableEnvironment
> 该接口作用是管理spring应用程序的配置信息，并提供配置属性的访问和操作；
> 在spring容器初始化的过程中被使用，主要用于**加载**、**解析**和**管理**应用程序的配置信息
> **主要功能**
> - 属性源(Property Source) 管理
>    - 管理着应用程序的属性源，包括系统属性、环境变量、配置文件命令行等，它负责将这些属性源合并成一个同意的属性空间，使得应用可以方便的访问和使用配置。
>       - 系统属性，可以通过System.getProperty获取；比如java版本，用户home目录等
>       - 环境变量，可以通过System.getenv(),比如系统执行路径Path，用户home目录
>       - 配置文件，比如properties、YML文件等
>       - 命令行参数，通过命令行传入的一些配置信息，比如--server.port=8080
> - 激活的配置文件profiles管理
>    - 负责管理和激活profiles文件，可以根据特定的条件激活不同的文件
> - 属性解析
>    - 提供了属性解析的功能，解析配置属性中的占位符，和SPEL表达式。使得配置属性可以相互引用和动态计算。
> 
**作用场景**
> - 创建应用上下文
>    - spring创建应用上下文的过程中，ConfigurableEnvironment负责加载合并应用程序的配置信息，为应用上下文提供配置信息。
> - 激活配置文件profiles
>    - 在激活配置文件 profiles 的过程中，ConfigurableEnvironment 负责根据配置的条件来激活或禁用不同的配置文件，以满足应用程序对不同环境的需求。
> - 属性解析
>    - 在实例化BeanDefinition的时候，ConfigurableEnvironment也会负责对配置属性进行解析，以确保注入正确的属性

接口继承关系图
![image.png](https://cdn.nlark.com/yuque/0/2024/png/22648511/1717152979152-73dfd64b-cffe-4e01-94f6-c8efd9195bae.png#averageHue=%238e6746&clientId=u355b0432-21aa-4&from=paste&height=873&id=kXKRB&originHeight=982&originWidth=911&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=99681&status=done&style=none&taskId=u3e152852-833e-4ea3-b10d-e48d538ac26&title=&width=809.7777777777778)
这个接口比较重要的两个部分就是设置spring的环境变量，通过spring.proflies或者系统资源配置properties。
###### 配置环境变量
通过createEnviroment()方法返回的StandardEnviroment类中的customizePropertySources方法会将java进程中的变量和系统的环境变量添加到资源列表中。
```java
public class StandardEnvironment extends AbstractEnvironment {

	/** System environment property source name: {@value} */
    //系统环境变量名称
	public static final String SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME = "systemEnvironment";

	/** JVM system properties property source name: {@value} */
    //JVM系统配置属性
	public static final String SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME = "systemProperties";

	@Override
	protected void customizePropertySources(MutablePropertySources propertySources) {
		propertySources.addLast(new MapPropertySource(SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME, getSystemProperties()));
		propertySources.addLast(new SystemEnvironmentPropertySource(SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, getSystemEnvironment()));
	}

}
```
###### 处理占位符
通过getEnvoriment()方法获取到的ConfigurableEnviroment接口继承自PropertyResolver的resolveRequiredPlaceholders去解析占位符和SPEL表达式
```java
protected String parseStringValue(
			String value, PlaceholderResolver placeholderResolver, Set<String> visitedPlaceholders) {

		StringBuilder result = new StringBuilder(value);

		int startIndex = value.indexOf(this.placeholderPrefix);
		while (startIndex != -1) {
			int endIndex = findPlaceholderEndIndex(result, startIndex);
			if (endIndex != -1) {
				String placeholder = result.substring(startIndex + this.placeholderPrefix.length(), endIndex);
				String originalPlaceholder = placeholder;
				if (!visitedPlaceholders.add(originalPlaceholder)) {
					throw new IllegalArgumentException(
							"Circular placeholder reference '" + originalPlaceholder + "' in property definitions");
				}
				// Recursive invocation, parsing placeholders contained in the placeholder key.
				placeholder = parseStringValue(placeholder, placeholderResolver, visitedPlaceholders);
				// Now obtain the value for the fully resolved key...
				String propVal = placeholderResolver.resolvePlaceholder(placeholder);
				if (propVal == null && this.valueSeparator != null) {
					int separatorIndex = placeholder.indexOf(this.valueSeparator);
					if (separatorIndex != -1) {
						String actualPlaceholder = placeholder.substring(0, separatorIndex);
						String defaultValue = placeholder.substring(separatorIndex + this.valueSeparator.length());
						propVal = placeholderResolver.resolvePlaceholder(actualPlaceholder);
						if (propVal == null) {
							propVal = defaultValue;
						}
					}
				}
				if (propVal != null) {
					// Recursive invocation, parsing placeholders contained in the
					// previously resolved placeholder value.
					propVal = parseStringValue(propVal, placeholderResolver, visitedPlaceholders);
					result.replace(startIndex, endIndex + this.placeholderSuffix.length(), propVal);
					if (logger.isTraceEnabled()) {
						logger.trace("Resolved placeholder '" + placeholder + "'");
					}
					startIndex = result.indexOf(this.placeholderPrefix, startIndex + propVal.length());
				}
				else if (this.ignoreUnresolvablePlaceholders) {
					// Proceed with unprocessed value.
					startIndex = result.indexOf(this.placeholderPrefix, endIndex + this.placeholderSuffix.length());
				}
				else {
					throw new IllegalArgumentException("Could not resolve placeholder '" +
							placeholder + "'" + " in value \"" + value + "\"");
				}
				visitedPlaceholders.remove(originalPlaceholder);
			}
			else {
				startIndex = -1;
			}
		}

		return result.toString();
	}
```
#### refresh
> 作用：
> 1、sycnorized 同步操作 避免refresh()方法还没结束再次发起启动或者销毁容器引起冲突 
> 2、[prepareRefresh](#OP8Jt) 做一些启动容器的准备工作，记录容器启动时间，标记“已启动”状态、检查环境变量等。
> 3、[obtainFreshBeanFactory](#EGGjf)初始化bean工厂和bean的加载和注册
> 4、[prepareBeanFactory](#YvbU3) 为beanFactory运行做一些初始化工作，以确保容器在运行的过程中能正确的加载、注册和管理bean
> 5、[postProcessBeanFactory](#iflcx) beanFactory初始化之后对一些特定的bean进行的后置处理
> 6、[invokeBeanFactoryPostProcessors](#TESMd)调用BeanFactoryPostProcessor实现类的postProcessBeanFactory方法
> 7、[registerBeanPostProcessors](#sOA8L)注册BeanPostProcessor 接口的实现类
> 8、initMessageSource初始化消息源
> 9、[initApplicationEventMulticaster](#CWjYu)初始化事件广播器
> 10、[onRefresh](#nlBHX)默认实现为空，在refresh最后被调用，完成容器刷新之后的一个回调方法
> 11、[registerListeners](#SELNF)注册事件监听器
> 12、[finishBeanFactoryInitialization](#yfXdf) 对注册到beanFactory中的beanDefinition进行实例化和初始化
> 13、[finishRefresh](#W591m)容器刷新方法，执行一些与容器启动和初始化相关的后续操作

```java
public abstract class AbstractApplicationContext extends DefaultResourceLoader
		implements ConfigurableApplicationContext {
            ......
            public void refresh() throws BeansException, IllegalStateException {
                //1、上锁
		synchronized (this.startupShutdownMonitor) {
			// 2、做一些准备工作
			prepareRefresh();	

			// 3、获取一个最新的beanFactory实例
			ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

			// 4、beanFactory运行前的初始化准备
			prepareBeanFactory(beanFactory);

			try {
				// 5、在容器初始化之后进行的一些特殊处理
				postProcessBeanFactory(beanFactory);

				// 6、调用BeanFactoryPostProcessor实现类的postProcessBeanFactory方法
				invokeBeanFactoryPostProcessors(beanFactory);

				// 7、注册BeanPostProcessor 接口的实现类
				registerBeanPostProcessors(beanFactory);

				// 8、初始化消息源
				initMessageSource();

				// 9、初始化事件广播器
				initApplicationEventMulticaster();

				// 10、容器刷新之后的回调，默认为空，可以拓展
				onRefresh();

				// 11、注册事件监听器
				registerListeners();

				// 12、对注册的bean进行初始化
				finishBeanFactoryInitialization(beanFactory);

				// 13、容器刷新方法
				finishRefresh();
			}

			catch (BeansException ex) {
				if (logger.isWarnEnabled()) {
					logger.warn("Exception encountered during context initialization - " +
							"cancelling refresh attempt: " + ex);
				}

				// Destroy already created singletons to avoid dangling resources.
				destroyBeans();

				// Reset 'active' flag.
				cancelRefresh(ex);

				// Propagate exception to caller.
				throw ex;
			}

			finally {
				// Reset common introspection caches in Spring's core, since we
				// might not ever need metadata for singleton beans anymore...
				resetCommonCaches();
			}
		}
	}
            ......
        }
```
##### prepareRefresh
> 做一些准备工作
> 1、记录容器的启动时间
> 2、标记启动状态active = true，close = false
> 3、初始化配置文件（无具体实现，留给用户的拓展点）
> 4、检查环境变量

```java
protected void prepareRefresh() {
		this.startupDate = System.currentTimeMillis();
		this.closed.set(false);
		this.active.set(true);

		if (logger.isInfoEnabled()) {
			logger.info("Refreshing " + this);
		}

		// 初始化配置文件
		initPropertySources();

		// Validate that all properties marked as required are resolvable
		// see ConfigurablePropertyResolver#setRequiredProperties
        //检查环境变量
		getEnvironment().validateRequiredProperties();

		// Allow for the collection of early ApplicationEvents,
		// to be published once the multicaster is available...
		this.earlyApplicationEvents = new LinkedHashSet<>();
	}
```
```java

public void validateRequiredProperties() {
      MissingRequiredPropertiesException ex = new MissingRequiredPropertiesException();
      for (String key : this.requiredProperties) {
          //如果存在key的环境变量value为null则抛出异常
         if (this.getProperty(key) == null) {
            ex.addMissingRequiredProperty(key);
         }
      }
      if (!ex.getMissingRequiredProperties().isEmpty()) {
         throw ex;
      }
   }
```
	在项目启动的时候，添加环境变量配置，将环境变量添加到requiredProperties中，可以在这里进行一个校验。
以上的初始化配置文件和给环境变量添加自己的校验规则都需要继承AnnotationConfigApplicationContext类去重写里面的方法。
##### obtainFreshBeanFactory
> 获取一个新的beanFactory，这个方法用于创建或者刷新应用的上下文中的beanFactory
> 1、销毁已存在的beanFacotry创建新的beanFactory
> 2、执行beanFactory的预初始化
> 3、解析xml文件，生成beanDenifition，把beanDenifition注册到BeanFactory的denifitionMap中

**DefaultListableBeanFactory**
//TODO 补充
**BeanDenifition**
//TODO补充
```java

protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
   // 核心，销毁以存在的beanFactory并创建新工厂
   refreshBeanFactory();

   // 返回刚刚创建的 BeanFactory
   ConfigurableListableBeanFactory beanFactory = getBeanFactory();
   if (logger.isDebugEnabled()) {
      logger.debug("Bean factory for " + getDisplayName() + ": " + beanFactory);
   }
   return beanFactory;
}
```
**refreshBeanFactory**
```java
@Override
	protected final void refreshBeanFactory() throws BeansException {
        //判断当前applicationContext是否存在Beanfacotry,存在则销毁bean关闭beanfactory
        //注意，一个应用可以存在多个beanFactory，这里是判断当前applicationContext
		if (hasBeanFactory()) {
			destroyBeans();
			closeBeanFactory();
		}
		try {
            //初始化DefaultListableBeanFactory
			DefaultListableBeanFactory beanFactory = createBeanFactory();
			beanFactory.setSerializationId(getId());
            //设置beanFactory的两个属性，是否允许bean覆盖，是否允许bean的循环引用
			customizeBeanFactory(beanFactory);
            //加载bean到beanfactory
			loadBeanDefinitions(beanFactory);
			synchronized (this.beanFactoryMonitor) {
				this.beanFactory = beanFactory;
			}
		}
		catch (IOException ex) {
			throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
		}
	}
```
> - customizeBeanFactory
>    - allowBeanDefinitionOverriding允许beanDefinition进行覆盖
>       - 设置为true之后，如果存在多个同名的bean的定义，容器会优先进行覆盖
>       - 设置为false，在出现同名定义的时候容器会抛出异常
>    - allowCircularReferences允许bean能否循环依赖
>       - spring默认不允许循环依赖
>       - spring默认是通过生成代理对象的形式来解决循环依赖问题
>          - 如果发现该bean存在循环依赖，提前**暴露半成品的bean**（正在创建但是还未初始化的bean的实例），这样其他bean就可以引用到这个bean了
>          - TODO 待补充

**loadBeanDefinitions - 1**
> 加载bean的定义到beanfactory中
> 1、解析系统指定的配置文件
> 2、根据传入的配置文件地址进行获取解析定义beandefinition

```java

@Override
protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
   // 实例化XmlBeanDefinitionReader
   XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
   beanDefinitionReader.setEnvironment(this.getEnvironment());
   beanDefinitionReader.setResourceLoader(this);
   beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));

   // 初始化 BeanDefinitionReader
   initBeanDefinitionReader(beanDefinitionReader);
   // 进入方法
   loadBeanDefinitions(beanDefinitionReader);
}

protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
   Resource[] configResources = getConfigResources();
   if (configResources != null) {
      reader.loadBeanDefinitions(configResources);
   }
   String[] configLocations = getConfigLocations();
   if (configLocations != null) {
      reader.loadBeanDefinitions(configLocations);
   }
}
```
第二个方法中的两个if，第一个if是看系统有没有指定配置文件，第二个if是通过传入地址获取的配置文件。
系统指定配置文件可以通过以下三种方式指定：

- 通过在spring配置文件中<context:property-placholder>标签指定配置的文件路径，然后在configLocations数组中添加这些配置文件的路径。
```java
<context:property-placeholder location="classpath:app.properties"/>

context.setConfigLocations(new String[]{"classpath:applicationContext.xml"});
```

- 通过注解propertySource指定配置文件路径，然后再通过configLocations去添加这些配置文件
```java
@Configuration
@PropertySource("classpath:app.properties")
public class AppConfig {
    // Configuration code here
}


context.register(AppConfig.class);
```

- 通过命令行参数的形式，指定系统配置文件
```java
java -jar myapp.jar --spring.config.location=classpath:/app.properties
```
**loadBeanDefinitions - 2**
> 将xml文件转换成resource对象

```java

public int loadBeanDefinitions(Resource... resources) throws BeanDefinitionStoreException {
   Assert.notNull(resources, "Resource array must not be null");
   int counter = 0;
   // 循环，处理所有配置文件，咱们这里就传了一个
   for (Resource resource : resources) {
      // 继续往下看
      counter += loadBeanDefinitions(resource);
   }
   // 最后返回加载的所有BeanDefinition的数量
   return counter;
}
@Override
   public int loadBeanDefinitions(String location) throws BeanDefinitionStoreException {
      return loadBeanDefinitions(location, null);
   }


public int loadBeanDefinitions(String location, @Nullable Set<Resource> actualResources) throws BeanDefinitionStoreException {
      ResourceLoader resourceLoader = getResourceLoader();
      if (resourceLoader == null) {
         throw new BeanDefinitionStoreException(
               "Cannot import bean definitions from location [" + location + "]: no ResourceLoader available");
      }

      if (resourceLoader instanceof ResourcePatternResolver) {
         try {
           //将配置文件转换为Resource对象
            Resource[] resources = ((ResourcePatternResolver) resourceLoader).getResources(location);
           //进入方法
            int loadCount = loadBeanDefinitions(resources);
            if (actualResources != null) {
               for (Resource resource : resources) {
                  actualResources.add(resource);
               }
            }
            if (logger.isDebugEnabled()) {
               logger.debug("Loaded " + loadCount + " bean definitions from location pattern [" + location + "]");
            }
            return loadCount;
         }
         catch (IOException ex) {
            throw new BeanDefinitionStoreException(
                  "Could not resolve bean definition resource pattern [" + location + "]", ex);
         }
      }
      else {
         // Can only load single resources by absolute URL.
         Resource resource = resourceLoader.getResource(location);
         int loadCount = loadBeanDefinitions(resource);
         if (actualResources != null) {
            actualResources.add(resource);
         }
         if (logger.isDebugEnabled()) {
            logger.debug("Loaded " + loadCount + " bean definitions from location [" + location + "]");
         }
         return loadCount;
      }
   }
```
**loadBeanDefinitions - 3**
> 因为这里测试的是传入的xml配置，所以会进入到XmlBeanDenifitionReader中的loadBeanDenifitions方法进行bean的解析。
> 通过其他的方式进行初始化则会进入到其他类中。

![](https://cdn.nlark.com/yuque/0/2024/webp/22648511/1717474388839-c90d1615-4255-441c-aeed-c5f3a27ec602.webp#averageHue=%23393e33&clientId=u5bef7518-ee19-4&from=paste&id=u21ec5c32&originHeight=281&originWidth=713&originalType=url&ratio=1.125&rotation=0&showTitle=false&status=done&style=none&taskId=u6359b459-bccb-4ca7-85f4-a30d886494c&title=)
```java
public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
      Assert.notNull(encodedResource, "EncodedResource must not be null");
      if (logger.isInfoEnabled()) {
         logger.info("Loading XML bean definitions from " + encodedResource.getResource());
      }

      Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();
      if (currentResources == null) {
         currentResources = new HashSet<>(4);
         this.resourcesCurrentlyBeingLoaded.set(currentResources);
      }
      if (!currentResources.add(encodedResource)) {
         throw new BeanDefinitionStoreException(
               "Detected cyclic loading of " + encodedResource + " - check your import definitions!");
      }
      try {
        //获取文件流
         InputStream inputStream = encodedResource.getResource().getInputStream();
         try {
            InputSource inputSource = new InputSource(inputStream);
            if (encodedResource.getEncoding() != null) {
               inputSource.setEncoding(encodedResource.getEncoding());
            }
           //加载
            return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
         }
         finally {
            inputStream.close();
         }
      }
      catch (IOException ex) {
         throw new BeanDefinitionStoreException(
               "IOException parsing XML document from " + encodedResource.getResource(), ex);
      }
      finally {
         currentResources.remove(encodedResource);
         if (currentResources.isEmpty()) {
            this.resourcesCurrentlyBeingLoaded.remove();
         }
      }
   }
```
> 文件转换及Document对象注册成bean

```java
protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
         throws BeanDefinitionStoreException {
      try {
          //将 xml 文件转换为 Document 对象
         Document doc = doLoadDocument(inputSource, resource);
         //根据Document对象注册Bean
         return registerBeanDefinitions(doc, resource);
      }
      catch (BeanDefinitionStoreException ex) {
         throw ex;
      }
      catch (SAXParseException ex) {
         throw new XmlBeanDefinitionStoreException(resource.getDescription(),
               "Line " + ex.getLineNumber() + " in XML document from " + resource + " is invalid", ex);
      }
      catch (SAXException ex) {
         throw new XmlBeanDefinitionStoreException(resource.getDescription(),
               "XML document from " + resource + " is invalid", ex);
      }
      catch (ParserConfigurationException ex) {
         throw new BeanDefinitionStoreException(resource.getDescription(),
               "Parser configuration exception parsing XML from " + resource, ex);
      }
      catch (IOException ex) {
         throw new BeanDefinitionStoreException(resource.getDescription(),
               "IOException parsing XML document from " + resource, ex);
      }
      catch (Throwable ex) {
         throw new BeanDefinitionStoreException(resource.getDescription(),
               "Unexpected exception parsing XML document from " + resource, ex);
      }
   }
```
> 注册bean

```java

public int registerBeanDefinitions(Document doc, Resource resource) throws BeanDefinitionStoreException {
   //构建读取Document的工具类
   BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
   //获取已注册的bean数量
   int countBefore = getRegistry().getBeanDefinitionCount();
   // 进入方法
   documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
   //总注册的bean减去之前注册的bean就是本次注册的bean
   return getRegistry().getBeanDefinitionCount() - countBefore;
}
@Override
public void registerBeanDefinitions(Document doc, XmlReaderContext readerContext) {
      this.readerContext = readerContext;
      logger.debug("Loading bean definitions");
        //获取Document的根节点
      Element root = doc.getDocumentElement();
        //继续往下
      doRegisterBeanDefinitions(root);
}

protected void doRegisterBeanDefinitions(Element root) {
   // 当前根节点
   BeanDefinitionParserDelegate parent = this.delegate;
   this.delegate = createDelegate(getReaderContext(), root, parent);

   if (this.delegate.isDefaultNamespace(root)) {
      // 获取 <beans ... profile="***" /> 中的 profile参数与当前环境是否匹配，如果不匹配则不再进行解析
      String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
      if (StringUtils.hasText(profileSpec)) {
         String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
            profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
         if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
            if (logger.isInfoEnabled()) {
               logger.info("Skipped XML bean definition file due to specified profiles [" + profileSpec +
                  "] not matching: " + getReaderContext().getResource());
            }
            return;
         }
      }
   }
   // 前置扩展点
   preProcessXml(root);
   // 往下看
   parseBeanDefinitions(root, this.delegate);
   // 后置扩展点
   postProcessXml(root);

   this.delegate = parent;
}
```
> 改变bean定义的扩展点
> preProcessXml和postProcessXml着两个办法是留给我们实现DefaultBeanDefinitionDocumentReader方法后自定义实现的

**parseBeanDefinitions**
> 解析xml

```java

protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
// default namespace 涉及到的就四个标签 <import />、<alias />、<bean /> 和 <beans />
   if (delegate.isDefaultNamespace(root)) {
      NodeList nl = root.getChildNodes();
      for (int i = 0; i < nl.getLength(); i++) {
         Node node = nl.item(i);
         if (node instanceof Element) {
            Element ele = (Element) node;
            if (delegate.isDefaultNamespace(ele)) {
               // 解析 default namespace 下面的几个元素
               parseDefaultElement(ele, delegate);
            }
            else {
               // 解析其他 namespace 的元素
               delegate.parseCustomElement(ele);
            }
         }
      }
   }
   else {
   // 解析其他 namespace 的元素
      delegate.parseCustomElement(root);
   }
}
```
> default标签处理

```java

private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
   if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
      // 处理 <import /> 标签
      importBeanDefinitionResource(ele);
   }
   else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
      // 处理 <alias /> 标签
      // <alias name="fromName" alias="toName"/>
      processAliasRegistration(ele);
   }
   else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
      // 处理 <bean /> 标签定义
      processBeanDefinition(ele, delegate);
   }
   else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
      // 处理 <beans /> 标签
      doRegisterBeanDefinitions(ele);
   }
}
```
> bean标签处理

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
       //创建BeanDefinition
      BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
      if (bdHolder != null) {
          //如果有自定义的属性，进行相应的分析
         bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
         try {
            // 注册bean
            BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
         }
         catch (BeanDefinitionStoreException ex) {
            getReaderContext().error("Failed to register bean definition with name '" +
                  bdHolder.getBeanName() + "'", ele, ex);
         }
         // 注册完成之后发送事件
         getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
      }
   }
```
> 1、[创建bean](https://www.yuque.com/tuoyueerwu/xrd7if/ygqku72du2q3hrcn?inner=ufee4db0d)
> 2、[注册bean](https://www.yuque.com/tuoyueerwu/xrd7if/ygqku72du2q3hrcn?inner=ub5d6a76f)

> 创建beandeifition

```java

public BeanDefinitionHolder parseBeanDefinitionElement(Element ele) {
    return parseBeanDefinitionElement(ele, null);
}

public BeanDefinitionHolder parseBeanDefinitionElement(Element ele, BeanDefinition containingBean) {
   String id = ele.getAttribute(ID_ATTRIBUTE);
   String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);

   List<String> aliases = new ArrayList<String>();

   // 将 name 属性的定义按照 “逗号、分号、空格” 切分，形成一个 别名列表数组，
   if (StringUtils.hasLength(nameAttr)) {
      String[] nameArr = StringUtils.tokenizeToStringArray(nameAttr, MULTI_VALUE_ATTRIBUTE_DELIMITERS);
      aliases.addAll(Arrays.asList(nameArr));
   }

   String beanName = id;
   // 如果没有指定id, 那么用别名列表的第一个名字作为beanName
   if (!StringUtils.hasText(beanName) && !aliases.isEmpty()) {
      beanName = aliases.remove(0);
      if (logger.isDebugEnabled()) {
         logger.debug("No XML 'id' specified - using '" + beanName +
               "' as bean name and " + aliases + " as aliases");
      }
   }

   if (containingBean == null) {
      checkNameUniqueness(beanName, aliases, ele);
   }

   // 根据 <bean ...>...</bean> 中的配置创建 BeanDefinition，然后把配置中的信息都设置到实例中,
   // 这行执行完毕，一个 BeanDefinition 实例就出来了。等下接着往下看
   AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);

   // <bean /> 标签完成
   if (beanDefinition != null) {
      // 如果没有设置 id 和 name，那么此时的 beanName 就会为 null
      if (!StringUtils.hasText(beanName)) {
         try {
            if (containingBean != null) {
               beanName = BeanDefinitionReaderUtils.generateBeanName(
                     beanDefinition, this.readerContext.getRegistry(), true);
            }
            else {
               beanName = this.readerContext.generateBeanName(beanDefinition);

               String beanClassName = beanDefinition.getBeanClassName();
               if (beanClassName != null &&
                     beanName.startsWith(beanClassName) && beanName.length() > beanClassName.length() &&
                     !this.readerContext.getRegistry().isBeanNameInUse(beanClassName)) {
                  // 把 beanClassName 设置为 Bean 的别名
                  aliases.add(beanClassName);
               }
            }
            if (logger.isDebugEnabled()) {
               logger.debug("Neither XML 'id' nor 'name' specified - " +
                     "using generated bean name [" + beanName + "]");
            }
         }
         catch (Exception ex) {
            error(ex.getMessage(), ele);
            return null;
         }
      }
      String[] aliasesArray = StringUtils.toStringArray(aliases);
      // 返回 BeanDefinitionHolder
      return new BeanDefinitionHolder(beanDefinition, beanName, aliasesArray);
   }

   return null;
}
```
> 创建bean的时候优先以指定的id设置成beanName，其次选取name的第一个，两者都没有则bean的name设置为空。

> 继续创建beandenifition

```java

public AbstractBeanDefinition parseBeanDefinitionElement(
      Element ele, String beanName, BeanDefinition containingBean) {

   this.parseState.push(new BeanEntry(beanName));

   String className = null;
   if (ele.hasAttribute(CLASS_ATTRIBUTE)) {
      className = ele.getAttribute(CLASS_ATTRIBUTE).trim();
   }

   try {

    String parent = null;      
    if (ele.hasAttribute(PARENT_ATTRIBUTE)) {
         parent = ele.getAttribute(PARENT_ATTRIBUTE);
      }
      // 创建 BeanDefinition，然后设置类信息
      AbstractBeanDefinition bd = createBeanDefinition(className, parent);

      // 设置 BeanDefinition 的一堆属性，这些属性定义在 AbstractBeanDefinition 中
      parseBeanDefinitionAttributes(ele, beanName, containingBean, bd);
      bd.setDescription(DomUtils.getChildElementValueByTagName(ele, DESCRIPTION_ELEMENT));

      /**
       * 下面的一堆是解析 <bean>......</bean> 内部的子元素，
       * 解析出来以后的信息都放到 bd 的属性中
       */

      // 解析 <meta />
      parseMetaElements(ele, bd);
      // 解析 <lookup-method />
      parseLookupOverrideSubElements(ele, bd.getMethodOverrides());
      // 解析 <replaced-method />
      parseReplacedMethodSubElements(ele, bd.getMethodOverrides());
    // 解析 <constructor-arg />
      parseConstructorArgElements(ele, bd);
      // 解析 <property />
      parsePropertyElements(ele, bd);
      // 解析 <qualifier />
      parseQualifierElements(ele, bd);

      bd.setResource(this.readerContext.getResource());
      bd.setSource(extractSource(ele));

      return bd;
   }
   catch (ClassNotFoundException ex) {
      error("Bean class [" + className + "] not found", ele, ex);
   }
   catch (NoClassDefFoundError err) {
      error("Class that bean class [" + className + "] depends on not found", ele, err);
   }
   catch (Throwable ex) {
      error("Unexpected failure during bean definition parsing", ele, ex);
   }
   finally {
      this.parseState.pop();
   }

   return null;
}
```
> 注册bean

```java

@Override
public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
      throws BeanDefinitionStoreException {

   Assert.hasText(beanName, "Bean name must not be empty");
   Assert.notNull(beanDefinition, "BeanDefinition must not be null");

   if (beanDefinition instanceof AbstractBeanDefinition) {
      try {
         ((AbstractBeanDefinition) beanDefinition).validate();
      }
      catch (BeanDefinitionValidationException ex) {
         throw new BeanDefinitionStoreException(...);
      }
   }

   BeanDefinition oldBeanDefinition;

   // 所有的 Bean 注册后都会被放入到这个beanDefinitionMap 中，查看是否已存在这个bean
   oldBeanDefinition = this.beanDefinitionMap.get(beanName);

   // 处理重复名称的 Bean 定义的情况
   if (oldBeanDefinition != null) {
      if (!isAllowBeanDefinitionOverriding()) {
         // 如果不允许覆盖的话，抛异常
        throw new BeanDefinitionStoreException(beanDefinition.getResourceDescription(), beanName,
                  "Cannot register bean definition [" + beanDefinition + "] for bean '" + beanName +
                  "': There is already [" + oldBeanDefinition + "] bound.");
      }
      else if (oldBeanDefinition.getRole() < beanDefinition.getRole()) {
         // 用框架定义的 Bean 覆盖用户自定义的 Bean 
      if (this.logger.isWarnEnabled()) {
               this.logger.warn("Overriding user-defined bean definition for bean '" + beanName +
                     "' with a framework-generated bean definition: replacing [" +
                     oldBeanDefinition + "] with [" + beanDefinition + "]");
            }
      }
      else if (!beanDefinition.equals(oldBeanDefinition)) {
         // 用新的 Bean 覆盖旧的 Bean
      if (this.logger.isWarnEnabled()) {
               this.logger.warn("Overriding user-defined bean definition for bean '" + beanName +
                     "' with a framework-generated bean definition: replacing [" +
                     oldBeanDefinition + "] with [" + beanDefinition + "]");
            }
      }
      else {
         // log...用同等的 Bean 覆盖旧的 Bean
      if (this.logger.isInfoEnabled()) {
               this.logger.info("Overriding bean definition for bean '" + beanName +
                     "' with a different definition: replacing [" + oldBeanDefinition +
                     "] with [" + beanDefinition + "]");
            }
      }
      // 覆盖
      this.beanDefinitionMap.put(beanName, beanDefinition);
   }
   else {
      // 判断是否已经有其他的 Bean 开始初始化了.注意，"注册Bean" 这个动作结束，Bean 依然还没有初始化 在 Spring 容器启动的最后，会 预初始化 所有的 singleton beans
      if (hasBeanCreationStarted()) {
         // Cannot modify startup-time collection elements anymore (for stable iteration)
         synchronized (this.beanDefinitionMap) {
            this.beanDefinitionMap.put(beanName, beanDefinition);
            List<String> updatedDefinitions = new ArrayList<String>(this.beanDefinitionNames.size() + 1);
            updatedDefinitions.addAll(this.beanDefinitionNames);
            updatedDefinitions.add(beanName);
            this.beanDefinitionNames = updatedDefinitions;
            if (this.manualSingletonNames.contains(beanName)) {
               Set<String> updatedSingletons = new LinkedHashSet<String>(this.manualSingletonNames);
               updatedSingletons.remove(beanName);
               this.manualSingletonNames = updatedSingletons;
            }
         }
      }
      else {
         // 将 BeanDefinition 放到这个 map 中，这个 map 保存了所有的 BeanDefinition
         this.beanDefinitionMap.put(beanName, beanDefinition);
         // 这是个 ArrayList，所以会按照 bean 配置的顺序保存每一个注册的 Bean 的名字
         this.beanDefinitionNames.add(beanName);
         // 这是个 LinkedHashSet，代表的是手动注册的 singleton bean，
         this.manualSingletonNames.remove(beanName);
      }
      this.frozenBeanDefinitionNames = null;
   }

   if (oldBeanDefinition != null || containsSingleton(beanName)) {
      resetBeanDefinition(beanName);
   }
}
```
> 1、根据配置的别名去注册bean，每个别名注册一次
> 2、将bean放入beanDefinitionMap中
> 3、根据map和定义的规则去处理重复beanName相同的bean，抛出异常或者覆盖
> 4、判断是否已经有其他的bean初始化了，”注册bean“这个动作结束，Bean依然还没有初始化，需要在容器启动的最后会预初始化所有singleton beans

**到这里已经初始化了Bean容器，<bean/>的配置也相应转换为了一个一个的beanDefinition,然后这些beanDefinition都注册到beanDefinitionMa中**
##### prepareBeanFactory
> beanFactory的准备工作：
> - 设置BeanFactory的类加载器
>    - spring中通常会用ApplicationContextClassLoader来加载bean
> - 添加BeanPostProcessor bean的后置处理器
>    - 这一步可以在bean初始化的过程中插入自定义的逻辑
>    - prepareBeanFactory方法会在beanFactory中注册一些核心的beanPostProcessor例如AutowiredAnnotationBeanPostProcessor、用于处理bean生命周期的CommAnnotationBeanPostProcessor等。
> - 设置BeanFactory的属性解析器
>    - 将bean中的字符串类型转换成java类型
>    - prepareBeanFactory方法会注册一些默认的属性解析器，例如时间解析器CustomDateEditor、文件路径解析器ResourceEditor等
> - 设置BeanFactory的依赖检查模式
>    - 指定beanFactory在创建bean实例时是否要检查其依赖关系是否满足
> - 注册BeanPostProcessorChecker
>    - 注册一个特殊的BeanProcessorChecker，用于检查是否注册了足够的BeanPostProcessor，BeanPostProcessor负责处理Bean的初始化和销毁过程，如果不存在则会抛出异常

```java
protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {

   // 设置为加载当前ApplicationContext类的类加载器
   beanFactory.setBeanClassLoader(getClassLoader());

   // 设置 BeanExpressionResolver
   beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));

   beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));

   // 这里是Spring的又一个扩展点
   //在所有实现了Aware接口的bean在初始化的时候，这个 processor负责回调，
   // 这个我们很常用，如我们会为了获取 ApplicationContext 而 implement ApplicationContextAware
   // 注意：它不仅仅回调 ApplicationContextAware，还会负责回调 EnvironmentAware、ResourceLoaderAware 等
   beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));

   // 下面几行的意思就是，如果某个 bean 依赖于以下几个接口的实现类，在自动装配的时候忽略它们，Spring 会通过其他方式来处理这些依赖。
   beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
   beanFactory.ignoreDependencyInterface(EmbeddedValueResolverAware.class);
   beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
   beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
   beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
   beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);

   //下面几行就是为特殊的几个 bean 赋值，如果有 bean 依赖了以下几个，会注入这边相应的值
   beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
   beanFactory.registerResolvableDependency(ResourceLoader.class, this);
   beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
   beanFactory.registerResolvableDependency(ApplicationContext.class, this);

   // 注册 事件监听器
   beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(this));

   // 如果存在bean名称为loadTimeWeaver的bean则注册一个BeanPostProcessor
   if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
      beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
      // Set a temporary ClassLoader for type matching.
      beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
   }

   // 如果没有定义 "environment" 这个 bean，那么 Spring 会 "手动" 注册一个
   if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
      beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
   }
   // 如果没有定义 "systemProperties" 这个 bean，那么 Spring 会 "手动" 注册一个
   if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
      beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
   }
   // 如果没有定义 "systemEnvironment" 这个 bean，那么 Spring 会 "手动" 注册一个
   if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
      beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
   }
}
```
##### postProcessBeanFactory
> 如果Bean实现了BeanFactoryPostProcessor接口，那么容器初始化的时候会调用postProcessBeanFactory里面的内容。
> 在容器刷新之前，允许对内部的 BeanFactory 进行进一步的定制、验证和扩展，以满足特定的应用场景需求。

##### invokeBeanFactoryPostProcessors
> 调用BeanFactoryProcessor各个实现类的postProcessBeanFactory方法

##### registerBeanPostProcessors
> 注册BeanPostProcessor实现类，此接口有两个方法postProcessBeforeInitialization和postProcessAfterInitialization，分别在bean初始化之前和初始化之后得到执行。

##### initApplicationEventMulticaster
> 初始化事件广播器
> 事件广播器是spring框架中负责管理事件监听以及事件发布与分发的核心组件之一，它实现了观察者模式，用于在Spring应用程序中进行事件的发布和监听。
> 当应用程序中某个事件发生时，事件广播器会将事件通知给注册了监听器的响应组件。

```java
private void initApplicationEventMulticaster() throws BeansException {
    //如果用户配置了自定义事件广播器，就使用用户的
      if (containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME )) {
           this.applicationEventMulticaster = (ApplicationEventMulticaster)
                   getBean( APPLICATION_EVENT_MULTICASTER_BEAN_NAME , 
                                 ApplicationEventMulticaster.class );
           if (logger.isInfoEnabled()) {
                   logger.info("Using ApplicationEventMulticaster [" 
                                     + this. applicationEventMulticaster + "]" );
            }
       }else {
        //使用默认的时间广播器
           this.applicationEventMulticaster = new SimpleApplicationEventMulticaster();
           if (logger.isInfoEnabled()) {
               logger.info("Unable to locate ApplicationEventMulticaster with name '"+
                        APPLICATION_EVENT_MULTICASTER_BEAN_NAME +
                        "': using default [" + this .applicationEventMulticaster + "]");
            }
       }
 }
```
> 以上代码作用：
> 初始化一个事件广播器的实例，注册到应用上下文中
> 如果用户自己定义了则使用用户定义的，如果没有定义默认使用SimpleApplicationEventMulticaster事件广播其。
> 默认的事件广播器有两种
> - SimpleApplicationEventMulticaster
>    - 简单的应用程序事件广播器，同步的将事件发送给监听者
> - AsyncApplicationEventMulticaster
>    - 异步的应用程序事件广播器，通过线程池异步的将事件发送给监听者

##### onRefresh
> onRefresh是一个空方法，这个是为子类提供一个扩展点，在容器刷新完成之后可以执行一些自定义的逻辑操作。
> 开发这可以通过继承AbstractApplicationContext类，并重写onRefresh方法，来添加额外的初始化、清理或者其他定制化的操作。

##### registerListeners
> 用于向事件广播器注册一些预定的监听器。以便它们接收并处理特定类型的事件。
> 这些监听器通常是容器提供的一些内置组件，用于处理容器生命周期事件或者其他应用程序事件。
> - applicationListenerAdapter类型的监听器
>    - 这类监听器用于处理容器的生命周期事件，如容器初始化完成，容器刷新完成，容器关闭等。spring中容器本身就是一个事件发布者，容器状态发生改变，会发布相应的事件通知，完成一系列的逻辑操作。
> - applicationContextAwareProcessor类型的监听器
>    - 这类监听器用于处理应用上下文相关事件，如获取上下文，设置应用上下文环境。通过注册这些监听器，spring可以在上下文初始完成之后将上下文对象传递给实现了ApplicationContextAware接口的bean
> - EnviromentAwareProcessor类型的监听器
>    - 这类监听器用于处理环境相关的事件，如获取应用程序的环境信息。可以在spring容器初始完成之后，将环境对象传递给实现了EnvirometAware接口的bean。

>    - 通过注册这些预定的监听器对象，可以让spring容器在不同的阶段触发相应的事件，并通知对应的监听器来处理。

```java

protected void registerListeners() {
      //先添加手动set的一些监听器
      for (ApplicationListener<?> listener : getApplicationListeners()) {
         getApplicationEventMulticaster().addApplicationListener(listener);
      }

      //取到监听器的名称，设置到广播器
      String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);
      for (String listenerBeanName : listenerBeanNames) {
         getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);
      }

      // 如果存在早期应用事件，发布
      Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
      this.earlyApplicationEvents = null;
      if (earlyEventsToProcess != null) {
         for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
            getApplicationEventMulticaster().multicastEvent(earlyEvent);
         }
      }
   }
```
##### finishBeanFactoryInitialization
> 用于完成beanFactory的初始化工作，当所有的BeanDefinition被加载到BeanFactory中之后，通过这个方法去完成bean的实例化和初始化。
> 主要包括以下几个步骤：
> - 实例化bean
>    - 根据BeanDenifition中的信息，通过反射或者其他方式来创建bean的实例
> - 依赖注入
>    - 对每个bean进行依赖注入，将它所依赖的其他bean注入到相应的属性中
> - 初始化bean
>    - 调用bean的初始化方法进行初始化工作
>    - @PostConstruct标注的方法
>    - 或者实现了InitializingBean接口的afterPropertiesSet()方法进行初始化工作。
> - 注册销毁回调
>    - 如果bean实现了DisposableBean接口或者定义了自定义的销毁方法（如@PreDestory标注的方法），则将其注册到容器中，以便在容器关闭时执行销毁操作。

```java
protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {

      if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
            beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) { 
        beanFactory.setConversionService(
               beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
      }

      if (!beanFactory.hasEmbeddedValueResolver()) {
         beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
      }
        //先初始化 LoadTimeWeaverAware 类型的 Bean
      String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
      for (String weaverAwareName : weaverAwareNames) {
         getBean(weaverAwareName);
      }
       //停止使用用于类型匹配的临时类加载器
      beanFactory.setTempClassLoader(null);
      //冻结所有的bean定义，即已注册的bean定义将不会被修改或后处理
      beanFactory.freezeConfiguration();
      //初始化
      beanFactory.preInstantiateSingletons();
   }
```
对以上代码出现的几个类进行解释
> ConversionService
> 主要用于类型转换，从配置文件中读到属性值时，将字符串类型的值转换成需要的类型。


> EmbeddedValueResolver
> 解析嵌入式的值，用于解析配置文件或注解中的占位符，将其替换成实际的值。
> 这些占位符通常用于在配置文件中引用其他配置文件，初始化的过程中embeddedValueResolver会将其解析成对应的属性值，注入到正确的bean中。

```java

@Component
public class PropertiesUtil implements EmbeddedValueResolverAware {

    private StringValueResolver resolver;

    @Override
    public void setEmbeddedValueResolver(StringValueResolver resolver) {
        this.resolver = resolver;
    }


    /**
     * 获取属性时直接传入属性名称即可
     */
    public String getPropertiesValue(String key) {
        StringBuilder name = new StringBuilder("${").append(key).append("}");
        return resolver.resolveStringValue(name.toString());
    }

}
```
**preInstantiateSingletons**
> 容器初始化完成之后被调用，预实例化所有的单例bean，它会遍历所有的bean定义，将所有被标记成单例的bean提前实例化，并放入spring的单例缓存中。（不是抽象类，是单例的，且不是懒加载的bean）
> spring中的单例bean都是存放在单例缓存中，拿的时候直接获取。

```java

public void preInstantiateSingletons() throws BeansException {
   if (this.logger.isDebugEnabled()) {
      this.logger.debug("Pre-instantiating singletons in " + this);
   }
   // this.beanDefinitionNames 保存了所有的 beanNames
   List<String> beanNames = new ArrayList<String>(this.beanDefinitionNames);

   for (String beanName : beanNames) {

      // 合并父 Bean 中的配置，主意<bean id="" class="" parent="" /> 中的 parent属性
      RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);

      // 不是抽象类、是单例的且不是懒加载的
      if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
         // 处理 FactoryBean
         if (isFactoryBean(beanName)) {
            //在 beanName 前面加上“&” 符号
            final FactoryBean<?> factory = (FactoryBean<?>) getBean(FACTORY_BEAN_PREFIX + beanName);
            // 判断当前 FactoryBean 是否是 SmartFactoryBean 的实现
            boolean isEagerInit;
            if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
               isEagerInit = AccessController.doPrivileged(new PrivilegedAction<Boolean>() {
                  @Override
                  public Boolean run() {
                     return ((SmartFactoryBean<?>) factory).isEagerInit();
                  }
               }, getAccessControlContext());
            }
            else {
               isEagerInit = (factory instanceof SmartFactoryBean &&
                     ((SmartFactoryBean<?>) factory).isEagerInit());
            }
            if (isEagerInit) {

               getBean(beanName);
            }
         }
         else {
            // 不是FactoryBean的直接使用此方法进行初始化
            getBean(beanName);
         }
      }
   }


  
   // 如果bean实现了 SmartInitializingSingleton 接口的，那么在这里得到回调
   for (String beanName : beanNames) {
      Object singletonInstance = getSingleton(beanName);
      if (singletonInstance instanceof SmartInitializingSingleton) {
         final SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
         if (System.getSecurityManager() != null) {
            AccessController.doPrivileged(new PrivilegedAction<Object>() {
               @Override
               public Object run() {
                  smartSingleton.afterSingletonsInstantiated();
                  return null;
               }
            }, getAccessControlContext());
         }
         else {
            smartSingleton.afterSingletonsInstantiated();
         }
      }
   }
}
```
> 以上说明：
> - bean是FactoryBean
>    - FactoryBean是一个接口，主要作用是定制bean的创建过程。
>    - 如果bean是FactoryBean则取获取FactoryBean的实例
>    - 判断当前的bean是否需要提前初始化，这一步通过检查FactoryBean是否实现了SmartFactoryBean接口	，并调用其isEagerInit()方法来判断是否需要提前初始化。
>    - 如果需要提前初始化，则调用getBean()来获取
> - bean不是FactoryBean
>    - 直接调用getBean()获取.
> - 如果单例bean实现了SmartInitializingSingleton接口
>    - 调用其afterSignletonslnstantiated()方法进行回调，这个方法会在所有的单例bean都完成之后调用，做一些额外的初始化操作。

**getBean**
>  获取bean
> 在容器启动时，根据名称或者类型去查找到指定的bean。

```java
@Override
public Object getBean(String name) throws BeansException {
   return doGetBean(name, null, null, false);
}

protected <T> T doGetBean(
      final String name, final Class<T> requiredType, final Object[] args, boolean typeCheckOnly)
      throws BeansException {
   // 获取beanName，处理两种情况，一个是前面说的 FactoryBean(前面带 ‘&’)，再一个这个方法是可以根据别名来获取Bean的，所以在这里是要转换成最正统的BeanName
  //主要逻辑就是如果是FactoryBean就把&去掉如果是别名就把根据别名获取真实名称后面就不贴代码了
   final String beanName = transformedBeanName(name);

   //最后的返回值
   Object bean;

   // 检查是否已初始化
   Object sharedInstance = getSingleton(beanName);
  //如果已经初始化过了，且没有传args参数就代表是get，直接取出返回
   if (sharedInstance != null && args == null) {
      if (logger.isDebugEnabled()) {
         if (isSingletonCurrentlyInCreation(beanName)) {
            logger.debug("...");
         }
         else {
            logger.debug("Returning cached instance of singleton bean '" + beanName + "'");
         }
      }
      // 这里如果是普通Bean 的话，直接返回，如果是 FactoryBean 的话，返回它创建的那个实例对象
      bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
   }

   else {
      // 如果存在prototype类型的这个bean
      if (isPrototypeCurrentlyInCreation(beanName)) {
                throw new BeanCurrentlyInCreationException(beanName);
      }

      // 如果当前BeanDefinition不存在这个bean且具有父BeanFactory
      BeanFactory parentBeanFactory = getParentBeanFactory();
      if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
         String nameToLookup = originalBeanName(name);
      // 返回父容器的查询结果
         if (args != null) {
            return (T) parentBeanFactory.getBean(nameToLookup, args);
         }
         else {
            return parentBeanFactory.getBean(nameToLookup, requiredType);
         }
      }

      if (!typeCheckOnly) {
         // typeCheckOnly 为 false，将当前 beanName 放入一个 alreadyCreated 的 Set 集合中。
         markBeanAsCreated(beanName);
      }

      /*
       * 到这就要创建bean了
       */
      try {
         final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
         checkMergedBeanDefinition(mbd, beanName, args);

         // 先初始化依赖的所有 Bean， depends-on 中定义的依赖
         String[] dependsOn = mbd.getDependsOn();
         if (dependsOn != null) {
            for (String dep : dependsOn) {
               // 检查是不是有循环依赖
               if (isDependent(beanName, dep)) {
                  throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                        "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
               }
               // 注册一下依赖关系
               registerDependentBean(dep, beanName);
               // 先初始化被依赖项
               getBean(dep);
            }
         }

         // 如果是单例的
         if (mbd.isSingleton()) {
            sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
               @Override
               public Object getObject() throws BeansException {
                  try {
                     // 执行创建 Bean，下面说
                     return createBean(beanName, mbd, args);
                  }
                  catch (BeansException ex) {
                     destroySingleton(beanName);
                     throw ex;
                  }
               }
            });
            bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
         }

         // 如果是prototype
         else if (mbd.isPrototype()) {
            Object prototypeInstance = null;
            try {
               beforePrototypeCreation(beanName);
               // 执行创建 Bean
               prototypeInstance = createBean(beanName, mbd, args);
            }
            finally {
               afterPrototypeCreation(beanName);
            }
            bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
         }

         // 如果不是 singleton 和 prototype 那么就是自定义的scope、例如Web项目中的session等类型，这里就交给自定义scope的应用方去实现
         else {
            String scopeName = mbd.getScope();
            final Scope scope = this.scopes.get(scopeName);
            if (scope == null) {
               throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
            }
            try {
               Object scopedInstance = scope.get(beanName, new ObjectFactory<Object>() {
                  @Override
                  public Object getObject() throws BeansException {
                     beforePrototypeCreation(beanName);
                     try {
                        // 执行创建 Bean
                        return createBean(beanName, mbd, args);
                     }
                     finally {
                        afterPrototypeCreation(beanName);
                     }
                  }
               });
               bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
            }
            catch (IllegalStateException ex) {
               throw new BeanCreationException(beanName,
                     "Scope '" + scopeName + "' is not active for the current thread; consider " +
                     "defining a scoped proxy for this bean if you intend to refer to it from a singleton",
                     ex);
            }
         }
      }
      catch (BeansException ex) {
         cleanupAfterBeanCreationFailure(beanName);
         throw ex;
      }
   }

   //检查bean的类型
   if (requiredType != null && bean != null && !requiredType.isInstance(bean)) {
      try {
         return getTypeConverter().convertIfNecessary(bean, requiredType);
      }
      catch (TypeMismatchException ex) {
         if (logger.isDebugEnabled()) {
            logger.debug("Failed to convert bean '" + name + "' to required type '" +
                  ClassUtils.getQualifiedName(requiredType) + "'", ex);
         }
         throw new BeanNotOfRequiredTypeException(name, requiredType, bean.getClass());
      }
   }
   return (T) bean;
}
```
> 以上代码解析：
> 1、从以上代码可知，spring自己维护的有两种bean的作用域：
> singleton单例（整个应用中只存在一个，整个容器中共享一个）
> prototype（每次注入或者通过spring上下文获取时，都会创建一个新的bean实例。）
> 2、据我们已知的还有两种作用域在springMVC框架下适用:
> request(每个http请求都会创建一个bean的实例)
> session(每个http会话创建一个bean的实例)
> 3、在portlet技术的web应用程序下适用：
> gloable session，为每个全局portLet会话创建一个bean的实例


**doCreateBean**
> 在doGetBean的过程中，如果存在bean的实例则直接返回，不存在则需要调用createBean方法去创建。

```java


protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) throws BeanCreationException {
   if (logger.isDebugEnabled()) {
      logger.debug("Creating instance of bean '" + beanName + "'");
   }
   RootBeanDefinition mbdToUse = mbd;

   // 确保 BeanDefinition 中的 Class 被加载
   Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
   if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
      mbdToUse = new RootBeanDefinition(mbd);
      mbdToUse.setBeanClass(resolvedClass);
   }

   // 准备方法覆写，如果bean中定义了 <lookup-method /> 和 <replaced-method />
   try {
      mbdToUse.prepareMethodOverrides();
   }
   catch (BeanDefinitionValidationException ex) {
      throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
            beanName, "Validation of method overrides failed", ex);
   }

   try {
      // 如果有代理的话直接返回
      Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
      if (bean != null) {
         return bean;
      }
   }
   catch (Throwable ex) {
      throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
            "BeanPostProcessor before instantiation of bean failed", ex);
   }
   // 创建 bean
   Object beanInstance = doCreateBean(beanName, mbdToUse, args);
   if (logger.isDebugEnabled()) {
      logger.debug("Finished creating instance of bean '" + beanName + "'");
   }
   return beanInstance;
}

protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args)
      throws BeanCreationException {

   BeanWrapper instanceWrapper = null;
   if (mbd.isSingleton()) {
    //如果是.factoryBean则从缓存删除
      instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
   }
   if (instanceWrapper == null) {
      // 实例化 Bean，这个方法里面才是终点，下面说
      instanceWrapper = createBeanInstance(beanName, mbd, args);
   }
   //bean实例
   final Object bean = (instanceWrapper != null ? instanceWrapper.getWrappedInstance() : null);
   //bean类型
   Class<?> beanType = (instanceWrapper != null ? instanceWrapper.getWrappedClass() : null);
   mbd.resolvedTargetType = beanType;

   synchronized (mbd.postProcessingLock) {
      if (!mbd.postProcessed) {
         try {
            // 循环调用实现了MergedBeanDefinitionPostProcessor接口的postProcessMergedBeanDefinition方法
         // Spring对这个接口有几个默认的实现，其中大家最熟悉的一个是操作@Autowired注解的
            applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
         }
         catch (Throwable ex) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                  "Post-processing of merged bean definition failed", ex);
         }
         mbd.postProcessed = true;
      }
   }

 
   // 解决循环依赖问题
   boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
         isSingletonCurrentlyInCreation(beanName));
   if (earlySingletonExposure) {
      if (logger.isDebugEnabled()) {
         logger.debug("Eagerly caching bean '" + beanName +
               "' to allow for resolving potential circular references");
      }
    //当正在创建A时，A依赖B，此时通过（8将A作为ObjectFactory放入单例工厂中进行early expose，此处B需要引用A，但A正在创建，从单例工厂拿到ObjectFactory，从而允许循环依赖
      addSingletonFactory(beanName, new ObjectFactory<Object>() {
         @Override
         public Object getObject() throws BeansException {
            return getEarlyBeanReference(beanName, mbd, bean);
         }
      });
   }

   Object exposedObject = bean;
   try {
      // 负责属性装配,很重要，下面说
      populateBean(beanName, mbd, instanceWrapper);
      if (exposedObject != null) {
         // 这里是处理bean初始化完成后的各种回调，例如init-method、InitializingBean 接口、BeanPostProcessor 接口
         exposedObject = initializeBean(beanName, exposedObject, mbd);
      }
   }
   catch (Throwable ex) {
      if (ex instanceof BeanCreationException && beanName.equals(((BeanCreationException) ex).getBeanName())) {
         throw (BeanCreationException) ex;
      }
      else {
         throw new BeanCreationException(
               mbd.getResourceDescription(), beanName, "Initialization of bean failed", ex);
      }
   }
   //同样的，如果存在循环依赖
   if (earlySingletonExposure) {
      Object earlySingletonReference = getSingleton(beanName, false);
      if (earlySingletonReference != null) {
         if (exposedObject == bean) {
            exposedObject = earlySingletonReference;
         }
         else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
            String[] dependentBeans = getDependentBeans(beanName);
            Set<String> actualDependentBeans = new LinkedHashSet<String>(dependentBeans.length);
            for (String dependentBean : dependentBeans) {
               if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
                  actualDependentBeans.add(dependentBean);
               }
            }
            if (!actualDependentBeans.isEmpty()) {
               throw new BeanCurrentlyInCreationException(beanName,
                     "Bean with name '" + beanName + "' has been injected into other beans [" +
                     StringUtils.collectionToCommaDelimitedString(actualDependentBeans) +
                     "] in its raw version as part of a circular reference, but has eventually been " +
                     "wrapped. This means that said other beans do not use the final version of the " +
                     "bean. This is often the result of over-eager type matching - consider using " +
                     "'getBeanNamesOfType' with the 'allowEagerInit' flag turned off, for example.");
            }
         }
      }
   }

   // 把bean注册到相应的Scope中
   try {
      registerDisposableBeanIfNecessary(beanName, bean, mbd);
   }
   catch (BeanDefinitionValidationException ex) {
      throw new BeanCreationException(
            mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
   }

   return exposedObject;
}
```
> createBean方法中解决循环依赖的代码部分：
> 1、A依赖B，B依赖A,在A创建的过程中判断A是否是单例且允许被解决循环依赖问题
> 2、将A作为ObjectFactory放入工厂中，作为早期曝光对象，然后创建B，创建B的过程中获取早期曝光对象作为A的引用，然后再将创建完成的B注入A中。

**createBeanInstance**
> 创建bean实例的方法

```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, Object[] args) {
   // 确保已经加载了此 class
   Class<?> beanClass = resolveBeanClass(mbd, beanName);

   // 校验类的访问权限
   if (beanClass != null && !Modifier.isPublic(beanClass.getModifiers()) && !mbd.isNonPublicAccessAllowed()) {
      throw new BeanCreationException(mbd.getResourceDescription(), beanName,
            "Bean class isn't public, and non-public access not allowed: " + beanClass.getName());
   }
   
   if (mbd.getFactoryMethodName() != null)  {
      // 采用工厂方法实例化
      return instantiateUsingFactoryMethod(beanName, mbd, args);
   }

  //是否第一次
   boolean resolved = false;
  //是否采用构造函数注入
   boolean autowireNecessary = false;
   if (args == null) {
      synchronized (mbd.constructorArgumentLock) {
         if (mbd.resolvedConstructorOrFactoryMethod != null) {
            resolved = true;
            autowireNecessary = mbd.constructorArgumentsResolved;
         }
      }
   }
   if (resolved) {
      if (autowireNecessary) {
         return autowireConstructor(beanName, mbd, null, null);
      }
      else {
         // 无参构造函数
         return instantiateBean(beanName, mbd);
      }
   }

   // 判断是否采用有参构造函数
   Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
   if (ctors != null ||
         mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_CONSTRUCTOR ||
         mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args))  {
      // 构造函数依赖注入
      return autowireConstructor(beanName, mbd, ctors, args);
   }

   // 调用无参构造函数
   return instantiateBean(beanName, mbd);
}
```
**instantiateBean**
> 实例化bean的无参构造方法

```java
protected BeanWrapper instantiateBean(final String beanName, final RootBeanDefinition mbd) {
   try {
      Object beanInstance;
      final BeanFactory parent = this;
      if (System.getSecurityManager() != null) {
         beanInstance = AccessController.doPrivileged(new PrivilegedAction<Object>() {
            @Override
            public Object run() {

               return getInstantiationStrategy().instantiate(mbd, beanName, parent);
            }
         }, getAccessControlContext());
      }
      else {
         // 具体实例化的实现，往下看
         beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, parent);
      }
      BeanWrapper bw = new BeanWrapperImpl(beanInstance);
      initBeanWrapper(bw);
      return bw;
   }
   catch (Throwable ex) {
      throw new BeanCreationException(
            mbd.getResourceDescription(), beanName, "Instantiation of bean failed", ex);
   }
}


public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {

   // 如果不存在方法覆写，那就使用 java 反射进行实例化，否则使用 CGLIB,
   if (bd.getMethodOverrides().isEmpty()) {
      Constructor<?> constructorToUse;
      synchronized (bd.constructorArgumentLock) {
         constructorToUse = (Constructor<?>) bd.resolvedConstructorOrFactoryMethod;
         if (constructorToUse == null) {
            final Class<?> clazz = bd.getBeanClass();
            if (clazz.isInterface()) {
               throw new BeanInstantiationException(clazz, "Specified class is an interface");
            }
            try {
               if (System.getSecurityManager() != null) {
                  constructorToUse = AccessController.doPrivileged(new PrivilegedExceptionAction<Constructor<?>>() {
                     @Override
                     public Constructor<?> run() throws Exception {
                        return clazz.getDeclaredConstructor((Class[]) null);
                     }
                  });
               }
               else {
                  constructorToUse = clazz.getDeclaredConstructor((Class[]) null);
               }
               bd.resolvedConstructorOrFactoryMethod = constructorToUse;
            }
            catch (Throwable ex) {
               throw new BeanInstantiationException(clazz, "No default constructor found", ex);
            }
         }
      }
      // 利用构造方法进行实例化
      return BeanUtils.instantiateClass(constructorToUse);
   }
   else {
      // 存在方法覆写，利用 CGLIB 来完成实例化，需要依赖于 CGLIB 生成子类，这里就不展开了
      return instantiateWithMethodInjection(bd, beanName, owner);
   }
}
```
> 1、如果存在方法覆写，就使用CGLIB进行实例化，不存在方法覆写就通过java反射进行实例化
> java反射实例：1、检查是否已经被resolvedConstructorOrFactoryMethod 解析
>     2、通过反射去获取其构造方法
>     3、将构造方法缓存到resolvedConstructorOrFactoryMethod 种
>      4、再利用BeanUtils.instantiateClass方法通过构造方法去进行实例化。

**populateBean**
> 属性装配

```java
protected void populateBean(String beanName, RootBeanDefinition mbd, BeanWrapper bw) {
   // bean的所有属性
   PropertyValues pvs = mbd.getPropertyValues();

   if (bw == null) {
      if (!pvs.isEmpty()) {
         throw new BeanCreationException(
               mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");
      }
      else {
         return;
      }
   }


   boolean continueWithPropertyPopulation = true;
   if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
       //如果存在BeanPostProcessor调用这些后置处理器
      for (BeanPostProcessor bp : getBeanPostProcessors()) {
         if (bp instanceof InstantiationAwareBeanPostProcessor) {
            InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
            // 如果返回 false，代表不需要进行后续的属性设值，也不需要再经过其他的 BeanPostProcessor 的处理
            if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
               continueWithPropertyPopulation = false;
               break;
            }
         }
      }
   }

   if (!continueWithPropertyPopulation) {
      return;
   }

   if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_NAME ||
         mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_TYPE) {
      MutablePropertyValues newPvs = new MutablePropertyValues(pvs);

      // 通过名字找到所有属性值，如果是 bean 依赖，先初始化依赖的 bean。记录依赖关系
      if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_NAME) {
         autowireByName(beanName, mbd, bw, newPvs);
      }

      // 通过类型装配。复杂一些
      if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_TYPE) {
         autowireByType(beanName, mbd, bw, newPvs);
      }

      pvs = newPvs;
   }

   boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
   boolean needsDepCheck = (mbd.getDependencyCheck() != RootBeanDefinition.DEPENDENCY_CHECK_NONE);

   if (hasInstAwareBpps || needsDepCheck) {
      PropertyDescriptor[] filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
      if (hasInstAwareBpps) {
         for (BeanPostProcessor bp : getBeanPostProcessors()) {
            if (bp instanceof InstantiationAwareBeanPostProcessor) {
               InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
               // 这里就是上方曾经提到过得对@Autowired处理的一个BeanPostProcessor了
               // 它会对所有标记@Autowired、@Value 注解的属性进行设值
               pvs = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
               if (pvs == null) {
                  return;
               }
            }
         }
      }
      if (needsDepCheck) {
         checkDependencies(beanName, mbd, filteredPds, pvs);
      }
   }
   // 设置 bean 实例的属性值
   applyPropertyValues(beanName, mbd, bw, pvs);
}
```
> 1、判断bean是否存在实例化前BeanPostProcessor后置处理器
> 调用这些后置处理器的postProcessAfterInstantiation方法；
> 如果任意一个返回false，表示不需要后续的属性填充
> 2、如果bean的装载方式是按名称或者是按类型装配
> 创建一个新的属性集合；
> 按名称自动装配则调用autowireByName
> 按类型自动装配则调用autowireByType
> 3、检查过滤属性描述符，处理实例化前的后置处理器，依赖检查

##### **finishRefresh**
> 清理初始化获得的一些资源

```java

protected void finishRefresh() {
      //看名字就知道了，清理刚才一系列操作使用到的资源缓存
      clearResourceCaches();

      // 初始化LifecycleProcessor
      initLifecycleProcessor();

      // 这个方法的内部实现是启动所有实现了Lifecycle接口的bean
      getLifecycleProcessor().onRefresh();

      //发布ContextRefreshedEvent事件
      publishEvent(new ContextRefreshedEvent(this));

      // 检查spring.liveBeansView.mbeanDomain是否存在，有就会创建一个MBeanServer
      LiveBeansView.registerApplicationContext(this);
   }
```
### 2、AnnotationApplicationContext
