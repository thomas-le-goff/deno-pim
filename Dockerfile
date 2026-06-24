FROM denoland/deno:2.7.14

WORKDIR /app

COPY . .

RUN deno cache --allow-scripts=npm:protobufjs src/

EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-sys", "src/main.ts"]
