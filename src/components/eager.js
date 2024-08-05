import {FileAttachment} from "npm:@observablehq/stdlib";

export async function loadEagerTable() {
    const eager = await FileAttachment("../data/eager.tsv").zip();
    const eagerTables = await Promise.all(eager.filenames.map(async fn => {
        const batchName = fn.split("/")[6];
        const tab = await eager.file(fn).tsv();
        return tab.map(row => ({
            batch_name:                batchName,
            sample:                    row.Sample,
            total_reads:               Number(row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-flagstat_total"]),
            mapped_reads:              Number(row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-mapped_passed"]),
            mapped_reads_post:         Number(row["Samtools Flagstat (post-samtools filter)_mqc-generalstats-samtools_flagstat_post_samtools_filter-mapped_passed"]),
            endog_endorspy:            Number(row["endorSpy_mqc-generalstats-endorspy-endogenous_dna"]),
            endog_endorspy_post:       Number(row["endorSpy_mqc-generalstats-endorspy-endogenous_dna_post"]),
            mean_coverage:             Number(row["QualiMap_mqc-generalstats-qualimap-mean_coverage"]),
            damage_5p1:                Number(row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime1"]),
            damage_5p2:                Number(row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime2"]),
            damage_3p1:                Number(row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime1"]),
            damage_3p2:                Number(row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime2"]),
            mean_read_length:          Number(row["DamageProfiler_mqc-generalstats-damageprofiler-mean_readlength"]),
            nr_snps_covered:           Number(row["snp_coverage_mqc-generalstats-snp_coverage-Covered_Snps"]),
            contam:                    Number(row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_estimate"]),
            contam_err:                Number(row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_SE"]),
            fastqc_preTrim_total_seq:  Number(row["FastQC (pre-Trimming)_mqc-generalstats-fastqc_pre_trimming-total_sequences"]),
            fastqc_postTrim_total_seq: Number(row["FastQC (post-Trimming)_mqc-generalstats-fastqc_post_trimming-total_sequences"]),
            percent_duplicates:        Number(row["Picard_mqc-generalstats-picard-PERCENT_DUPLICATION"]),
            xrate:                     Number(row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateX"]),
            yrate:                     Number(row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateY"]),
            xrateErr:                  Number(row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrX"]),
            yrateErr:                  Number(row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrY"]),
        }));
    }));
    return eagerTables.reduce((acc, curr) => acc.concat(curr), []);
}

export async function loadEagerTableRaw() {
    const eager = await FileAttachment("../data/eager.tsv").zip();
    const eagerTables = await Promise.all(eager.filenames.map(async fn => {
        const batchName = fn.split("/")[6];
        const tab = await eager.file(fn).tsv();
        return tab.map(row => {
            row.batch_name = batchName;
            return row;
        });
    }));
    return eagerTables.reduce((acc, curr) => acc.concat(curr), []);
}