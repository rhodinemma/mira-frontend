import { useState, useEffect, useRef, useMemo } from "react";
import {
  MantineProvider,
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Select,
  Group,
  Button,
  FileInput,
  Stack,
  Notification,
  Progress,
  Card,
  Badge,
  Divider,
  Loader,
  Grid,
  ScrollArea,
  Accordion,
  ThemeIcon,
  Collapse,
  Modal,
  ActionIcon,
  Tooltip,
  PasswordInput,
  Pill,
  Avatar,
  Checkbox,
  Anchor,
  Menu,
  SimpleGrid,
  Flex,
  Image,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import stripAnsi from "strip-ansi";
import {
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandBitbucket,
  IconGitMerge,
  IconLock,
  IconUpload,
  IconCheck,
  IconX,
  IconTerminal2,
  IconServer,
  IconCloudUpload,
  IconRocket,
  IconCircleCheck,
  IconCodeCircle2,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconLogout,
  IconUserCircle,
  IconSearch,
  IconCode,
  IconBrandGit,
  IconKey,
  IconLink,
  IconFolder,
} from "@tabler/icons-react";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import "@mantine/core/styles.css";
import { TbFileZip, TbUpload, TbX } from "react-icons/tb";
import { IoIosGitBranch } from "react-icons/io";

function App() {
  const [submissionState, setSubmissionState] = useState("idle"); // idle, submitting, success, error
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  // const [deploymentProgress, setDeploymentProgress] = useState(0);
  // const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoSelectModalOpen, setRepoSelectModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [build, setBuild] = useState([]);
  const logsRef = useRef(null);

  const form = useForm({
    initialValues: {
      applicationName: "",
      sourceCodeType: "",
      gitProvider: "",
      sourceCodeLocation: "",
      repository: null,
      branch: "",
      zipFile: null,
    },

    validate: {
      applicationName: (value) =>
        !value ? "Application name is required" : null,
      sourceCodeType: (value) =>
        !value ? "Please select a source code type" : null,
      gitProvider: (values) => {
        if (values.sourceCodeType === "Git Repository" && !values.gitProvider) {
          return "Please select a Git provider";
        }
        return null;
      },
      sourceCodeLocation: (value, values) => {
        if (values.sourceCodeType === "Zip File") {
          return values.zipFile ? null : "Please upload a zip file";
        }

        if (
          values.sourceCodeType === "Git Repository" &&
          authenticated &&
          selectedRepo
        ) {
          return null;
        }

        if (values.sourceCodeType === "Git Repository" && !authenticated) {
          return "Please authenticate with your Git provider";
        }

        if (values.sourceCodeType === "Custom URL") {
          if (!value) {
            return "Repository URL is required";
          }

          const urlPattern =
            /^(https?:\/\/)?([\w-]+(\.[\w-]+)+|localhost)(:\d+)?(\/\S*)?$/;
          if (!urlPattern.test(value)) {
            return "Please enter a valid URL";
          }
        }

        return null;
      },
    },
  });

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsRef.current && deploymentLogs.length > 0) {
      logsRef.current.scrollTo({
        top: logsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [deploymentLogs]);

  // Mock repositories data
  const mockRepositories = {
    github: [
      {
        id: "gh1",
        name: "my-react-app",
        description: "A React application with TypeScript",
        stars: 12,
        updated: "2025-03-15",
        language: "TypeScript",
        private: false,
      },
      {
        id: "gh2",
        name: "node-express-api",
        description: "RESTful API with Express and MongoDB",
        stars: 34,
        updated: "2025-04-01",
        language: "JavaScript",
        private: false,
      },
      {
        id: "gh3",
        name: "company-website",
        description: "Official company website",
        stars: 5,
        updated: "2025-03-22",
        language: "Vue",
        private: true,
      },
      {
        id: "gh4",
        name: "image-processor",
        description: "Serverless image processing functions",
        stars: 8,
        updated: "2025-02-18",
        language: "Python",
        private: false,
      },
      {
        id: "gh5",
        name: "data-visualization",
        description: "Dashboard with D3.js",
        stars: 17,
        updated: "2025-03-30",
        language: "JavaScript",
        private: false,
      },
      {
        id: "gh6",
        name: "mobile-app",
        description: "React Native mobile application",
        stars: 23,
        updated: "2025-04-05",
        language: "JavaScript",
        private: true,
      },
    ],
    gitlab: [
      {
        id: "gl1",
        name: "backend-service",
        description: "Microservice for data processing",
        stars: 7,
        updated: "2025-03-12",
        language: "Go",
        private: false,
      },
      {
        id: "gl2",
        name: "machine-learning",
        description: "ML model training and prediction",
        stars: 15,
        updated: "2025-03-25",
        language: "Python",
        private: true,
      },
      {
        id: "gl3",
        name: "design-system",
        description: "Component library for frontend apps",
        stars: 9,
        updated: "2025-04-02",
        language: "TypeScript",
        private: false,
      },
    ],
    bitbucket: [
      {
        id: "bb1",
        name: "legacy-app",
        description: "Legacy application maintenance",
        stars: 2,
        updated: "2025-01-15",
        language: "PHP",
        private: true,
      },
      {
        id: "bb2",
        name: "internal-tools",
        description: "Internal developer tools",
        stars: 4,
        updated: "2025-03-28",
        language: "Python",
        private: true,
      },
    ],
  };

  // // Mock deployment logs with timestamps
  // const simulateDeployment = (appData) => {
  //   const repoName = appData.repository
  //     ? appData.repository.name
  //     : "custom-repo";
  //   const provider = appData.gitProvider || "custom";

  //   const logMessages = [
  //     {
  //       timestamp: new Date(),
  //       message: `Initializing deployment for ${appData.applicationName}...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Validating source code configuration...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Source code type: ${appData.sourceCodeType}`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message:
  //         appData.sourceCodeType === "Git Repository"
  //           ? `Using ${provider} repository: ${repoName}`
  //           : `Using custom URL: ${appData.sourceCodeLocation}`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Starting build process...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Pulling source code...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Installing dependencies...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Running build commands...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Build completed successfully`,
  //       type: "success",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Creating container image...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Pushing image to registry...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Preparing deployment environment...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Applying configuration...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Scaling deployment to 1 replica...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Checking health probes...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Deployment successful! Application is now running.`,
  //       type: "success",
  //     },
  //   ];

  //   // Reset logs
  //   setDeploymentLogs([]);
  //   setDeploymentProgress(0);
  //   setFormCollapsed(true);

  //   // Simulate log streaming
  //   let currentProgress = 0;
  //   const maxProgress = logMessages.length;

  //   logMessages.forEach((log, index) => {
  //     setTimeout(() => {
  //       const newLog = {
  //         ...log,
  //         timestamp: new Date(),
  //       };

  //       setDeploymentLogs((prev) => [...prev, newLog]);

  //       currentProgress++;
  //       const progressPercentage = Math.round(
  //         (currentProgress / maxProgress) * 100
  //       );
  //       setDeploymentProgress(progressPercentage);

  //       // When deployment is complete
  //       if (index === logMessages.length - 1) {
  //         setDeploymentStatus({
  //           status: "Running",
  //           url: `https://${appData.applicationName
  //             .toLowerCase()
  //             .replace(/\s+/g, "-")}.example.com`,
  //           replicas: 1,
  //           version: "1.0.0",
  //           createdAt: new Date().toISOString(),
  //           resources: {
  //             cpu: "100m",
  //             memory: "256Mi",
  //           },
  //           repository: appData.repository
  //             ? {
  //                 name: appData.repository.name,
  //                 provider: appData.gitProvider,
  //                 url: `https://${appData.gitProvider.toLowerCase()}.com/${
  //                   authUser?.username
  //                 }/${appData.repository.name}`,
  //               }
  //             : null,
  //         });
  //         setSubmissionState("success");
  //       }
  //     }, 800 * (index + 1)); // Stagger the logs for realism
  //   });
  // };

  // // Simulate failed deployment
  // const simulateFailedDeployment = (appData) => {
  //   const repoName = appData.repository
  //     ? appData.repository.name
  //     : "custom-repo";
  //   const provider = appData.gitProvider || "custom";

  //   const logMessages = [
  //     {
  //       timestamp: new Date(),
  //       message: `Initializing deployment for ${appData.applicationName}...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Validating source code configuration...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Source code type: ${appData.sourceCodeType}`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message:
  //         appData.sourceCodeType === "Git Repository"
  //           ? `Using ${provider} repository: ${repoName}`
  //           : `Using custom URL: ${appData.sourceCodeLocation}`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Starting build process...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Pulling source code...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Installing dependencies...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Running build commands...`,
  //       type: "info",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `ERROR: Build failed with exit code 1`,
  //       type: "error",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `npm ERR! code ELIFECYCLE`,
  //       type: "error",
  //     },
  //     { timestamp: new Date(), message: `npm ERR! errno 1`, type: "error" },
  //     {
  //       timestamp: new Date(),
  //       message: `npm ERR! app@1.0.0 build: \`vite build\``,
  //       type: "error",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `npm ERR! Exit status 1`,
  //       type: "error",
  //     },
  //     {
  //       timestamp: new Date(),
  //       message: `Deployment failed. Please check your application code and try again.`,
  //       type: "error",
  //     },
  //   ];

  //   // Reset logs
  //   setDeploymentLogs([]);
  //   setDeploymentProgress(0);
  //   setFormCollapsed(true);

  //   // Simulate log streaming
  //   let currentProgress = 0;
  //   const maxProgress = 8; // Progress will stop at 8/13 (about 62%)

  //   logMessages.forEach((log, index) => {
  //     setTimeout(() => {
  //       const newLog = {
  //         ...log,
  //         timestamp: new Date(),
  //       };

  //       setDeploymentLogs((prev) => [...prev, newLog]);

  //       if (index < maxProgress) {
  //         currentProgress++;
  //         const progressPercentage = Math.round((currentProgress / 15) * 100); // Using 15 as max to show incomplete progress
  //         setDeploymentProgress(progressPercentage);
  //       }

  //       // When deployment fails
  //       if (index === logMessages.length - 1) {
  //         setSubmissionState("error");
  //         setError("Build failed. Please check the logs for more details.");
  //       }
  //     }, 800 * (index + 1)); // Stagger the logs for realism
  //   });
  // };

  const handleSubmit = async (values) => {
    try {
      // Set state to submitting
      setSubmissionState("submitting");
      setError(null);

      console.log("Form values:", values);

      const response = await fetch("http://localhost:8080/api/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: values.sourceCodeLocation,
          branch: values.branch,
          command: values.command,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start build");
      }

      const data = await response.json();
      setBuild(data);
    } catch (err) {
      setError(
        "An error occurred while submitting your application. Please try again."
      );
      setSubmissionState("error");
      console.error(err);
    }
  };

  useEffect(() => {
    let interval;

    // Poll for updates if the build is in progress
    if (build.status === "started") {
      interval = setInterval(async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/builds/${build.buildId}`
          );
          if (response.ok) {
            const updatedBuild = await response.json();
            setBuild(updatedBuild);
            // setDeploymentProgress(100);
            setDeploymentLogs(updatedBuild.logs);

            // Stop polling if build is complete
            if (updatedBuild.status !== "started") {
              clearInterval(interval);
              setSubmissionState("idle");
            }
          }
        } catch (error) {
          console.error("Error fetching build status:", error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [build.buildId, build.status, setBuild]);

  // const resetForm = () => {
  //   form.reset();
  //   setSubmissionState("idle");
  //   setDeploymentLogs([]);
  //   setDeploymentProgress(0);
  //   // setDeploymentStatus(null);
  //   setError(null);
  //   setFormCollapsed(false);
  //   setSelectedRepo(null);
  // };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setAuthModalOpen(true);
  };

  const handleLogin = () => {
    // Mock authentication
    setTimeout(() => {
      const userInfo = {
        username:
          selectedProvider === "GitHub"
            ? "rhodinemma"
            : selectedProvider === "GitLab"
            ? "gitlab_user"
            : "bbuser",
        name:
          selectedProvider === "GitHub"
            ? "Rhodin Nagwere"
            : selectedProvider === "GitLab"
            ? "GitLab User"
            : "BitBucket User",
        email: `user@${selectedProvider.toLowerCase()}.com`,
        avatar: `https://ui-avatars.com/api/?name=${selectedProvider}&background=random`,
      };

      setAuthUser(userInfo);
      setAuthenticated(true);
      setAuthModalOpen(false);
      form.setFieldValue("gitProvider", selectedProvider);
    }, 1000);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthenticated(false);
    setRepositories([]);
    setSelectedRepo(null);
    form.setFieldValue("gitProvider", "");
    form.setFieldValue("repository", null);
  };

  const loadRepositories = () => {
    setLoadingRepos(true);

    // Simulate API call to fetch repositories
    setTimeout(() => {
      const providerKey = selectedProvider.toLowerCase();
      setRepositories(mockRepositories[providerKey] || []);
      setLoadingRepos(false);
      setRepoSelectModalOpen(true);
    }, 1000);
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    form.setFieldValue("repository", repo);
    setRepoSelectModalOpen(false);
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getProviderIcon = (provider) => {
    switch (provider) {
      case "GitHub":
        return <IconBrandGithub size={16} />;
      case "GitLab":
        return <IconBrandGitlab size={16} />;
      case "BitBucket":
        return <IconBrandBitbucket size={16} />;
      default:
        return <IconBrandGit size={16} />;
    }
  };

  const sourceCodeOptions = [
    {
      value: "Git Repository",
      label: "Git Repository",
      icon: <IconBrandGit size={16} />,
    },
    {
      value: "Custom URL",
      label: "Custom Public URL",
      icon: <IconLink size={16} />,
    },
    { value: "Zip File", label: "Zip File", icon: <IconUpload size={16} /> },
  ];

  const gitProviderOptions = [
    { value: "GitHub", label: "GitHub", icon: <IconBrandGithub size={16} /> },
    { value: "GitLab", label: "GitLab", icon: <IconBrandGitlab size={16} /> },
    {
      value: "BitBucket",
      label: "BitBucket",
      icon: <IconBrandBitbucket size={16} />,
    },
  ];

  // Format log timestamp
  // const formatTimestamp = (date) => {
  //   return date.toLocaleTimeString("en-US", {
  //     hour12: false,
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     fractionalSecondDigits: 3,
  //   });
  // };

  // Get log color based on type
  const getLogColor = (type) => {
    switch (type.toLowerCase()) {
      case "error":
        return "red";
      case "debug":
        return "blue";
      case "info":
      default:
        return "green";
    }
  };

  // Get language color
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "yellow",
      TypeScript: "blue",
      Python: "indigo",
      Go: "cyan",
      Vue: "green",
      PHP: "grape",
      default: "gray",
    };
    return colors[language] || colors.default;
  };

  console.log("build", build);

  const parsedLogs = useMemo(() => {
    if (!build?.logs) return [];
    return build.logs
      .split("\n")
      .map((line) => {
        const clean = stripAnsi(line);
        let type = "info";
        if (clean.includes("[DEBUG]")) type = "debug";
        else if (clean.includes("[ERROR]")) type = "error";
        return { message: clean, type };
      })
      .filter((log) => log.message.trim() !== "");
  }, [build?.logs]);

  return (
    <MantineProvider>
      <Container size="md" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Flex align="left" justify="start" gap="md" mb={6}>
            <Image
              h={50}
              w={50}
              src="https://raw.githubusercontent.com/crane-cloud/frontend/staging/public/favicon.png"
            />
            <Box pos="relative" display="inline-block">
              <Title>Deploy with mira</Title>
              <Badge
                color="#f7b21f"
                variant="filled"
                size="sm"
                pos="absolute"
                top={-1}
                right={-45}
              >
                New
              </Badge>
            </Box>
          </Flex>

          {error && (
            <Notification
              icon={<IconX size="1.1rem" />}
              color="red"
              title="Deployment Error"
              mb="md"
              onClose={() => setError(null)}
            >
              {error}
            </Notification>
          )}

          {/* Application Form */}
          <Card withBorder p="md" radius="md" mb="md">
            <Group justify="space-between" mb="xs">
              {submissionState !== "idle" && (
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setFormCollapsed(!formCollapsed)}
                  rightSection={
                    formCollapsed ? (
                      <IconChevronDown size="0.8rem" />
                    ) : (
                      <IconChevronUp size="0.8rem" />
                    )
                  }
                >
                  {formCollapsed ? "Show Form" : "Hide Form"}
                </Button>
              )}
            </Group>

            <Collapse in={!formCollapsed}>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing="md">
                  <TextInput
                    required
                    label="Application Name"
                    placeholder="Enter application name"
                    description="Enter the name of the application"
                    {...form.getInputProps("applicationName")}
                  />

                  <Select
                    required
                    label="Source Code Location"
                    placeholder="Select source code location"
                    data={sourceCodeOptions}
                    itemComponent={({ label, icon }) => (
                      <Group gap="xs">
                        {icon}
                        <span>{label}</span>
                      </Group>
                    )}
                    {...form.getInputProps("sourceCodeType")}
                  />

                  {form.values.sourceCodeType === "Git Repository" && (
                    <>
                      {!authenticated ? (
                        <Card withBorder p="xs" radius="md">
                          <Text size="sm" fw={500} mb="xs">
                            Select Git Provider
                          </Text>
                          <Group grow>
                            {gitProviderOptions.map((provider) => (
                              <Button
                                key={provider.value}
                                variant="light"
                                size="xs"
                                leftSection={provider.icon}
                                onClick={() =>
                                  handleProviderSelect(provider.value)
                                }
                              >
                                {provider.label}
                              </Button>
                            ))}
                          </Group>
                          <Text size="xs" c="dimmed" mt="xs">
                            Connect your Git provider to access your
                            repositories
                          </Text>
                        </Card>
                      ) : (
                        <Card withBorder p="xs" radius="md">
                          <Group position="apart">
                            <Group>
                              <Avatar
                                src={authUser.avatar}
                                size="sm"
                                radius="xl"
                              />
                              <div>
                                <Text size="sm" fw={500}>
                                  {authUser.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  @{authUser.username}
                                </Text>
                              </div>
                              {getProviderIcon(selectedProvider)}
                            </Group>
                            <Group>
                              <Button
                                variant="light"
                                size="xs"
                                onClick={loadRepositories}
                              >
                                {selectedRepo
                                  ? "Change Repository"
                                  : "Select Repository"}
                              </Button>
                              <Menu>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" size="sm">
                                    <IconChevronDown size="1rem" />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconLogout size="0.9rem" />}
                                    onClick={handleLogout}
                                  >
                                    Disconnect
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Group>

                          {selectedRepo && (
                            <Card withBorder p="xs" mt="xs" radius="md">
                              <Group>
                                <IconFolder size="1rem" />
                                <Text size="sm" fw={500}>
                                  {selectedRepo.name}
                                </Text>
                                {selectedRepo.private && (
                                  <Badge size="xs" variant="light">
                                    Private
                                  </Badge>
                                )}
                              </Group>
                              {selectedRepo.description && (
                                <Text size="xs" c="dimmed" mt="xs">
                                  {selectedRepo.description}
                                </Text>
                              )}
                              <Group mt="xs" spacing="xs">
                                <Pill
                                  size="xs"
                                  radius="xl"
                                  bg={getLanguageColor(selectedRepo.language)}
                                >
                                  {selectedRepo.language}
                                </Pill>
                                <Text size="xs" c="dimmed">
                                  Updated{" "}
                                  {new Date(
                                    selectedRepo.updated
                                  ).toLocaleDateString()}
                                </Text>
                              </Group>
                            </Card>
                          )}
                        </Card>
                      )}
                    </>
                  )}

                  {form.values.sourceCodeType === "Custom URL" && (
                    <>
                      <TextInput
                        required
                        label="Repository URL"
                        placeholder="Enter repository URL"
                        leftSection={<IconLink size={16} />}
                        {...form.getInputProps("sourceCodeLocation")}
                      />

                      <TextInput
                        required
                        label="Branch"
                        placeholder="main"
                        leftSection={<IoIosGitBranch size={16} />}
                        {...form.getInputProps("branch")}
                      />
                    </>
                  )}

                  {form.values.sourceCodeType === "Zip File" && (
                    <>
                      <Dropzone
                        name="file"
                        onDrop={(files) => form.setFieldValue("zipFile", files)}
                        accept={[MIME_TYPES.zip, MIME_TYPES.rar]}
                        maxFiles={1}
                        maxSize={3 * 1024 ** 2}
                      >
                        <Group
                          justify="center"
                          gap="xl"
                          mih={120}
                          style={{ pointerEvents: "none" }}
                        >
                          <Dropzone.Accept>
                            <TbUpload
                              size={52}
                              color="var(--mantine-color-blue-6)"
                            />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <TbX size={52} color="var(--mantine-color-red-6)" />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            <TbFileZip
                              size={52}
                              color="var(--mantine-color-dimmed)"
                            />
                          </Dropzone.Idle>
                          <div>
                            <Text size="xl" inline>
                              Drag zip/rar here or click to select
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                              Single archive file, not exceeding 3MB
                            </Text>
                          </div>
                        </Group>
                      </Dropzone>
                    </>
                  )}

                  <Group justify="center" mt="xs">
                    <Button
                      type="submit"
                      size="sm"
                      leftSection={<IconCloudUpload size="1rem" />}
                      loading={submissionState === "submitting"}
                      disabled={submissionState === "submitting"}
                    >
                      Deploy Application
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Collapse>
          </Card>

          {build.status === "completed" && (
            <>
              <Box p="md" style={{ borderTop: "1px solid #dee2e6" }}>
                <Box>
                  <Text size="sm">
                    <Text span fw={500}>
                      Build ID:
                    </Text>{" "}
                    {build.buildId}
                  </Text>

                  <Text size="sm" mt="xs">
                    <Text span fw={500}>
                      Status:
                    </Text>{" "}
                    <Badge
                      color={
                        build.status === "completed"
                          ? "green"
                          : build.status === "failed"
                          ? "red"
                          : "gray"
                      }
                      variant="light"
                      size="sm"
                      style={{ textTransform: "capitalize" }}
                    >
                      {build.status}
                    </Badge>
                  </Text>

                  <Text size="sm" mt="xs">
                    <Text span fw={500}>
                      Started:
                    </Text>{" "}
                    {new Date(build.startTime).toLocaleString()}
                  </Text>

                  {build.finishTime && (
                    <Text size="sm" mt="xs">
                      <Text span fw={500}>
                        Finished:
                      </Text>{" "}
                      {new Date(build.finishTime).toLocaleString()}
                    </Text>
                  )}

                  {build.logs && (
                    <Box mt="sm">
                      <Text fw={500} size="sm" mb="xs">
                        Logs:
                      </Text>

                      <ScrollArea h={200} type="auto" offsetScrollbars>
                        <Stack spacing={0}>
                          {parsedLogs.map((log, index) => (
                            <Text
                              key={index}
                              size="xs"
                              c={getLogColor(log.type)}
                              ff="monospace"
                            >
                              {log.message}
                            </Text>
                          ))}
                        </Stack>
                      </ScrollArea>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Container>

      {/* Git Provider Authentication Modal */}
      <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={
          <Group>
            {selectedProvider && getProviderIcon(selectedProvider)}
            <Text>Connect to {selectedProvider}</Text>
          </Group>
        }
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <Stack>
            <TextInput
              required
              label="Username or Email"
              placeholder={`Enter your ${selectedProvider} username`}
              leftSection={<IconUserCircle size="1rem" />}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Enter your password"
              leftSection={<IconLock size="1rem" />}
            />

            <Checkbox label="Remember me on this device" mt="xs" />

            <Text size="xs" c="dimmed">
              We'll connect securely to {selectedProvider} using OAuth. We don't
              store your credentials.
            </Text>

            <Group justify="center" mt="md">
              <Button type="submit" leftSection={<IconLock size="1rem" />}>
                Authenticate
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Repository Selection Modal */}
      <Modal
        opened={repoSelectModalOpen}
        onClose={() => setRepoSelectModalOpen(false)}
        title={
          <Group>
            {selectedProvider && getProviderIcon(selectedProvider)}
            <Text>Select Repository</Text>
          </Group>
        }
        size="lg"
      >
        <TextInput
          placeholder="Search repositories..."
          leftSection={<IconSearch size="1rem" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="md"
        />

        {loadingRepos ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : (
          <>
            {filteredRepositories.length === 0 ? (
              <Text ta="center" p="xl" c="dimmed">
                No repositories found matching your search
              </Text>
            ) : (
              <ScrollArea h={300} type="auto">
                <Stack>
                  {filteredRepositories.map((repo) => (
                    <Card
                      key={repo.id}
                      withBorder
                      p="sm"
                      radius="md"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRepoSelect(repo)}
                    >
                      <Group position="apart">
                        <Group>
                          <IconFolder size="1.2rem" />
                          <Text fw={500}>{repo.name}</Text>
                          {repo.private && (
                            <Badge size="xs" variant="light">
                              Private
                            </Badge>
                          )}
                        </Group>
                        <Badge
                          leftSection={<IconBrandGit size="0.8rem" />}
                          color={getLanguageColor(repo.language)}
                          variant="light"
                        >
                          {repo.language}
                        </Badge>
                      </Group>
                      {repo.description && (
                        <Text size="sm" c="dimmed" mt="xs">
                          {repo.description}
                        </Text>
                      )}
                      <Group mt="xs">
                        <Text size="xs" c="dimmed">
                          Updated {new Date(repo.updated).toLocaleDateString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          ★ {repo.stars}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </>
        )}
      </Modal>
    </MantineProvider>
  );
}

export default App;
