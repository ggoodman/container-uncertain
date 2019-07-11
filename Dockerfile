ARG image=node:10-alpine

FROM ${image} as node_modules
ENV NODE_ENV=production
WORKDIR /srv
ADD package.json package-lock.json /srv/
RUN npm ci --only=production && mkdir -p /srv/node_modules

FROM ${image}
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=node_modules /srv/package.json /srv/
COPY --from=node_modules /srv/node_modules /srv/node_modules
ADD lib /srv/lib
CMD [ "node", "." ]