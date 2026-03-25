FROM ubuntu:22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install basic services
RUN apt-get update && apt-get install -y \
    openssh-server \
    cron \
    sudo \
    curl \
    net-tools \
    iputils-ping \
    vim \
    php-cli \
    && rm -rf /var/lib/apt/lists/*

# Setup SSH
RUN mkdir /var/run/sshd
RUN echo 'root:root' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Setup a mock web directory
RUN mkdir -p /var/www/html

# Expose SSH
EXPOSE 22

# Copy the infection script
COPY infect.sh /usr/local/bin/infect.sh
RUN chmod +x /usr/local/bin/infect.sh

# Run infection and start services
CMD ["/bin/bash", "-c", "/usr/local/bin/infect.sh && /usr/sbin/sshd -D"]
