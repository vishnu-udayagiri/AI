set -e
git pull
mbt build -t gen --mtar mta.tar
cf deploy gen/mta.tar

# DB Builds
# cds deploy --to hana:airindia-dev-db