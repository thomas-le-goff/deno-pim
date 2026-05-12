FROM quay.io/fedora/fedora:42

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    container=oci

RUN dnf install -y \
      bash \
      ca-certificates \
      coreutils \
      curl \
      findutils \
      git \
      glibc-langpack-en \
      jq \
      just \
      less \
      nodejs \
      npm \
      postgresql \
      procps-ng \
      shadow-utils \
      sudo \
      tar \
      unzip \
      util-linux \
      which \
    && dnf clean all

RUN curl -fsSL https://deno.land/install.sh | sh -s -- --yes

WORKDIR /workspace
